import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a transporter object
const MAIL_SETTINGS = {
  host: "host57.registrar-servers.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_TRAP_USER,
    pass: process.env.MAIL_TRAP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
};

export const sendVerificationMail = async (
  email: string,
  item: number | string,
  fullname: string,
  htmlGenerator: (fullname: string, item: number | string) => string
) => {
  const transporter = nodemailer.createTransport(MAIL_SETTINGS);
  const htmlContent = htmlGenerator(fullname, item);

  const mailOptions = {
    from: MAIL_SETTINGS.auth.user,
    to: email,
    subject: "Polema Email Verification",
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};
