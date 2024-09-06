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
  verifyToken,
} from "../utilities/auths";
import { sendVerificationMail } from "../utilities/sendVerification";
import {
  generateTokenEmailHTML,
  generateVerificationEmailHTML,
} from "../utilities/htmls";
import Role from "../models/role";

export const loginurl = `http/3000/frontend login`;

export const signupAdmin = async (req: Request, res: Response) => {
  try {
    const validationResult = signUpSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    const { email, password, roleName , firstname} = req.body;

    const exist = await AdminInstance.findOne({ where: { email } });

    if (exist) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ error: "Role does not exist" });
    }
    const passwordHashed = await bcryptEncode({ value: password });

    const admin = (await AdminInstance.create({
      ...req.body,
      password: passwordHashed,
      role: "admin",
      roleId: role.dataValues.id,
      isAdmin: true,
    })) as unknown as AdminInstance;

    await sendVerificationMail(
      email,
      loginurl,
      firstname,
      generateVerificationEmailHTML
    );

    //console.log(admin);
    return res.status(201).json({
      message:
        "Admin created successfully, Check your email to activate your account",
      admin,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred" });
  }
};

export const loginMial = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await AdminInstance.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        error: "user not found please sign up",
      });
    }
    if (user.dataValues.isVerified) {
      return res.status(400).json({ error: "User already verified" });
    }
    const fullname = user.dataValues.firstname;

    await sendVerificationMail(
      email,
      loginurl,
      fullname,
      generateVerificationEmailHTML
    );
    return res.status(201).json({
      message: "A new login has been sent to your mail",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
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
    //console.log("adminnnnnn", admin);
    if (!admin.dataValues.active) {
      return res.status(403).json({ error: "unauthorized access" });
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
    const { id, isAdmin } = admin.dataValues;
    const token = await generateToken(id, isAdmin);

    console.log(token);
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
    const { id, isAdmin, firstname } = user.dataValues;
    const token = await generateToken(id, isAdmin);

    await user.update({ ...req.body, resetPasswordToken: token });

    await sendVerificationMail(email, token, firstname, generateTokenEmailHTML);

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
