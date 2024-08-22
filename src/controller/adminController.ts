import { Request, Response } from "express";
import {
  loginSchema,
  option,
  resetPasswordSchema,
  signUpSchema,
} from "../validations/userValidation";
import AdminInstance from "../models/admin";
import OTPInstance from "../models/otps";
import {
  bcryptDecode,
  bcryptEncode,
  generateOtp,
  generateToken,
  verifyToken,
} from "../utilities/auths";
import { sendVerificationMail } from "../utilities/sendVerification";
import {
  generateTokenEmailHTML,
  generateVerificationEmailHTML,
} from "../utilities/htmls";

export const signupAdmin = async (req: Request, res: Response) => {
  try {
    const validationResult = signUpSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    const { email, password, fullname } = req.body;

    const exist = await AdminInstance.findOne({ where: { email } });

    if (exist) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const passwordHashed = await bcryptEncode({ value: password });
    const { otp, expiry } = generateOtp();

    const admin = await AdminInstance.create({
      ...req.body,
      password: passwordHashed,
      role: "admin",
      isAdmin: true,
    }) as unknown as AdminInstance;
    const myOTP = await OTPInstance.create({
      ...req.body,
      userId: admin.dataValues.id,
      otp,
      expiry,
    });
    await sendVerificationMail(
      email,
      otp,
      fullname,
      generateVerificationEmailHTML
    );

    console.log(admin);
    return res
      .status(201)
      .json({
        message:
          "Admin created successfully, Check your email to activate your account",
        admin,
        myOTP,
      });
  } catch (error: unknown) { if( error instanceof Error){

    res.status(500).json({ error: error.message });
  }
  res.status(500).json({error: 'An error occurred'})
  }
};

;

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await AdminInstance.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        error: "user not found",
      });
    }
    if (user.dataValues.isVerified) {
      return res.status(400).json({ error: "User already verified" });
    }
    const fullname = user.dataValues.fullname;
    const { otp, expiry } = generateOtp();
    const newUser = await OTPInstance.update(
      {
        otp,
        expiry,
      },
      { where: { userId: user.dataValues.id } }
    );

    await sendVerificationMail(
      email,
      otp,
      fullname,
      generateVerificationEmailHTML
    );
    return res.status(201).json({
      message: "A new OTP has been sent to your mail", newUser
    });
  } catch (error: unknown){
    if (error instanceof Error){
      res.status(500).json({ error: error.message });
    } res.status(500).json({error: "An unexpected error occurred."})
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code } = req.body;
    //console.log("Received OTP:", code);

    const userOTP = await OTPInstance.findOne({
      where: { otp: code, userId: id },
    });

    if (!userOTP) {
      return res
        .status(404)
        .json({ error: "OTP not found or invalid for this user" });
    }

    const user = await AdminInstance.findOne({
      where: { id: userOTP.dataValues.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.dataValues.isVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const { otp, expiry } = userOTP.dataValues;
    const now = new Date();

    if (otp !== code || now > new Date(expiry)) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    await user.update({
      isVerified: true,
    });

    await OTPInstance.destroy({
      where: { id: userOTP.dataValues.id }
    });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to update user verification status" });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const valid = loginSchema.validate(req.body, option);
    if (valid.error) {
      return res.status(400).json({ error: valid.error.details[0].message });
    }
    const admin = (await AdminInstance.findOne({
      where: { email },
    })) as AdminInstance;
    if (!admin) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    console.log("adminnnnnn", admin);
    if(!admin.dataValues.active){
      return res.status(403).json({error: "unauthorized access"})
    }

    const isValid = await bcryptDecode(password, admin.dataValues.password);
    if (!isValid) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    if (!admin.dataValues.isVerified) {
      return res.status(401).json({
        error: "please verify your email",
      });
    }
    const { id, products } = admin.dataValues;
    const token = await generateToken(id, products);

    console.log(token);
    return res
      .status(200)
      .json({ messages: "login successfull", admin, token });
  } catch (error: unknown) { if( error instanceof Error){

    res.status(500).json({ error: error.message });
  }
  res.status(500).json({error: 'An error occurred'})
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await AdminInstance.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }
    const { id, products, fullname } = user.dataValues;
    const token = await generateToken(id, products);

    await user.update({ ...req.body, resetPasswordToken: token });

    await sendVerificationMail(email, token, fullname, generateTokenEmailHTML);

    return res
      .status(200)
      .json({ message: "Reset password link sent to your email" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  console.log(req.body);
  const { token } = req.params;
  const { password } = req.body;

  try {
    const validatedInput = resetPasswordSchema.validate(req.body, option);
    if (validatedInput.error) {
      return res
        .status(400)
        .json({ error: validatedInput.error.details[0].message });
    }

    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({
        error: "Invalid or expired token",
      });
    }

    const { id } = decodedToken as unknown as { [key: string]: string };

    const user = await AdminInstance.findOne({ where: { id: id } });
    console.log("userrr", user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      const passwordHashed = await bcryptEncode({ value: password });
      req.body.password = passwordHashed;

      const updated = await user.update({
        ...req.body,
        password: passwordHashed,
        resetPasswordToken: null,
      });

      return res
        .status(200)
        .json({ message: "Password reset successful", updated });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
