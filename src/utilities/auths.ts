import bcryptjs from "bcryptjs";
import Jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import Permission from "../models/permission";
dotenv.config();

export const generateToken = async (roleId: string,  isAdmin: boolean| undefined) => {
  const payload = { roleId, isAdmin};
  return Jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};
const generateeToken = async (admin: any) => {
  const permissions = admin.role.permissions.map((permission: Permission) => permission.dataValues.name);

  console.log(permissions, "permissionss")

  const tokenPayload = {
    id: admin.id,
    role: admin.role.name,
    permissions, // Embed permissions into the token
  };

  return Jwt.sign(tokenPayload, process.env.JWT_SECRET as string, { expiresIn: '1d' });
 };


export const verifyToken = async (token: string) : Promise<string | JwtPayload>=> {
  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch (error: unknown) {
    console.error("Error verifying token:", error);
    if (error instanceof Jwt.TokenExpiredError) {
      return "token expired";
    } else {
      throw error;
    }
  }
};
export const bcryptEncode = async (value: { value: string }) => {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(value.value, salt);
};

export const bcryptDecode = async (
  password: string,
  comparePassword: string
) => {
  return bcryptjs.compare(password, comparePassword);
};

export const generateOtp = ()=> {
  const otp =  Math.floor(1000+ Math.random()*9000);
  const expiry = new Date();

  expiry.setTime(new Date().getTime() + 50 * 60 * 1000);

  return {otp, expiry}
};

 