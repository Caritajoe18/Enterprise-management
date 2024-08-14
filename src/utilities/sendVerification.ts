// Import the Nodemailer library
import  nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config()

// Create a transporter object
const MAIL_SETTINGS = {
	host: 'smtp.gmail.com',
        port: 587,
        secure: false, 
        auth: {
          user: process.env.GMAIL,
          pass: process.env.APP_PASSWORD,
	},
};

export const sendVerificationMail = async(email: string, otp: number, fullname: string)=>{

    const transporter = nodemailer.createTransport(MAIL_SETTINGS); 
// Configure the mailoptions object
const mailOptions = {
    from: MAIL_SETTINGS.auth.user,
    to: email,
    subject: 'Polema Email Verification',
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OTP Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #0d0c0c;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
    
            margin: 0;
            color: #121312;
          }
          .container {
            max-width: 600px;
            display: flex;
            flex-direction: column;
            align-items: center;
            align-content: center;
            justify-content: center;
            background-color: #e5e0e0;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            color: #121312;
            margin: 0;
          }
          .content {
            text-align: center;
          }
          .content p {
            font-size: 16px;
            margin: 20px 0;
          }
          .otp {
            display: inline-block;
            padding: 10px 20px;
            font-size: 24px;
            color: #fff;
            background-color: #0f100f;
            border-radius: 4px;
            text-decoration: none;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
          }
          .footer a {
            color: #0d0e0d;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>OTP Verification</h1>
          </div>
          <div class="content">
            <p>Hi ${fullname},</p>
            <p>
              We've received a request to verify your account. Please use the OTP
              below to complete the verification process:
            </p>
            <p><a href="#" class="otp">${otp}</a></p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; Polema. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `
  };
  
  // Send the email
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });

}

