import { Request, Response } from "express";
import {
  loginSchema,
  option,
  resetPasswordSchema,
  signUpSchema,
} from "../validations/adminValidation";
import AdminInstance from "../models/admin";
import {
  bcryptDecode,
  bcryptEncode,
  generateToken,
  toPascalCase,
  tokenExpiry,
  verifyToken,
} from "../utilities/auths";
import { sendVerificationMail } from "../utilities/sendVerification";
import {
  generateTokenEmailHTML,
  generateVerificationEmailHTML,
} from "../utilities/htmls";
import crypto from "crypto"; 
import { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const loginurl =
  process.env.LOGIN_URL || "https://polema.bookbank.com.ng";
  
export const signupAdmin = async (req: Request, res: Response) => {
  try {
    const validationResult = signUpSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    let { email, roleId, firstname, lastname, isAdmin, department } =
      req.body;

    firstname = toPascalCase(firstname);
    lastname = toPascalCase(lastname);
    email = email.toLowerCase();

    const exist = await AdminInstance.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const randomPassword =  crypto.randomBytes(3).toString("hex");
    const passwordHashed = await bcryptEncode({ value: randomPassword });

    const admin = await AdminInstance.create({
      ...req.body,
      password: passwordHashed,
      roleId,
      firstname,
      lastname,
      email,
      department,
      isAdmin: true,
    });

    // Send verification email
    await sendVerificationMail(
      email,
      loginurl,
      firstname,
      generateVerificationEmailHTML,
      randomPassword
    );

    // Return response
    return res.status(201).json({
      message:
        "Admin created successfully, check your email to activate your account",
      admin,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
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
      return res.status(401).json({ error: "invalid Email" });
    }
    if (!admin.dataValues.active) {
      return res.status(403).json({ error: "unauthorized access" });
    }

    const isValid = await bcryptDecode(password, admin.dataValues.password);
    if (!isValid) {
      return res.status(401).json({ error: "invalid password" });
    }
    // if (!admin.dataValues.isVerified) {
    //   return res.status(401).json({
    //     error: "please verify your email",
    //   });
    // }
    const { id, roleId, isAdmin } = admin.dataValues;
    const token = await generateToken(id, roleId, isAdmin);

    return res
      .status(200)
      .json({ messages: "login successfull", admin, token });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await AdminInstance.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }
    const { id, isAdmin, roleId, firstname } = user.dataValues;
    const token = await generateToken(id, roleId, isAdmin);
    const hashedToken = await bcryptEncode({ value: token });

    await user.update({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiry: tokenExpiry,
    });

    await sendVerificationMail(email, token, firstname, generateTokenEmailHTML);

    return res.status(200).json({
      message:
        "A reset password link that will expire in 15 minutes will be sent to this email",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.query;
  const { password } = req.body;

  try {
    const validatedInput = resetPasswordSchema.validate(req.body, option);
    if (validatedInput.error) {
      return res
        .status(400)
        .json({ error: validatedInput.error.details[0].message });
    }

    const decodedToken = await verifyToken(token as string);

    if (!decodedToken) {
      return res.status(401).json({
        error: "Invalid or expired token",
      });
    }
    if (!decodedToken || typeof decodedToken === "string") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = decodedToken as JwtPayload;

    const user = await AdminInstance.findOne({
      where: {
        id: userId.id,
      },
    });
    if (!user) {
      return res.status(404).json({ error: `User not found` });
    }
    const resetPasswordToken = user.dataValues.resetPasswordToken;
    const resetPasswordTokenExpiry = user.dataValues.resetPasswordTokenExpiry;

    if (!resetPasswordToken || !resetPasswordTokenExpiry) {
      return res
        .status(400)
        .json({ error: "No reset password token found or token expired." });
    }

    const tokenIsValid = await bcryptDecode(
      token as string,
      resetPasswordToken as unknown as string
    );
    if (!tokenIsValid) {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (resetPasswordTokenExpiry < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: "Token has expired" });
    }

    const passwordHashed = await bcryptEncode({ value: password });

    const updated = await user.update({
      password: passwordHashed,
      resetPasswordTokenExpiry: null,
      resetPasswordToken: null,
    });

    return res
      .status(200)
      .json({ message: "Password reset successful" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};
