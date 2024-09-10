"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationMail = void 0;
// Import the Nodemailer library
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create a transporter object
const MAIL_SETTINGS = {
    // host: 'smtp.gmail.com',
    //       port: 587,
    //       secure: false, 
    //       auth: {
    //         user: process.env.GMAIL,
    //         pass: process.env.APP_PASSWORD,
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: process.env.MAIL_TRAP_USER,
        pass: process.env.MAIL_TRAP_PASS
    },
};
const sendVerificationMail = async (email, item, fullname, htmlGenerator) => {
    const transporter = nodemailer_1.default.createTransport(MAIL_SETTINGS);
    const htmlContent = htmlGenerator(fullname, item);
    const mailOptions = {
        from: MAIL_SETTINGS.auth.user,
        to: email,
        subject: 'Polema Email Verification',
        html: htmlContent,
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error:', error);
        }
        else {
            console.log('Email sent: ', info.response);
        }
    });
};
exports.sendVerificationMail = sendVerificationMail;
//# sourceMappingURL=sendVerification.js.map