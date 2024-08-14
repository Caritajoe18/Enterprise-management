import bcryptjs, { genSalt } from "bcryptjs";
import Jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = async (input: Record<string, string>) => {
  console.log(process.env.JWT_SECRET);
  return Jwt.sign(input, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

export const verifyToken = async (token: string) => {
  try {
    const verifyy = Jwt.verify(token, process.env.JWT_SECRET as string);
    return verifyy;
  } catch (error) {
    return "token expired";
  }
};

export const bcryptEncode = async (value: { value: string }) => {
  return bcryptjs.hash(value.value, await genSalt());
};

export const bcryptDecode = async (password: string, comparePassword: string) => {
  return bcryptjs.compare(password, comparePassword);
};

export const generateCode = (): number => {
  return Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
};
