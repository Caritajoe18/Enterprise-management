import bcryptjs from "bcryptjs";
import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = async (id: string, role: string) => {
  const payload = { id, role };
  return Jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};


export const verifyToken = async (token: string) => {
  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch (error) {
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

 