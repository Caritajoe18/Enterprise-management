// Import the Nodemailer library
import  nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config()

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

export const sendVerificationMail = async(email: string,
  item: number | string,
  fullname: string,
  htmlGenerator: (fullname: string, item: number | string) => string) =>{

    const transporter = nodemailer.createTransport(MAIL_SETTINGS); 
    const htmlContent = htmlGenerator(fullname, item); 

const mailOptions = {
    from: MAIL_SETTINGS.auth.user,
    to: email,
    subject: 'Polema Email Verification',
    html: htmlContent,
  };
  
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });

}

