export const generateVerificationEmailHTML = (
  fullname: string,
  item: number | string
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Polema Verification Mail</title>
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
            margin:auto;
            height: fit-content;
            width: fit-content;
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
            <h1>Your Login</h1>
          </div>
          <div class="content">
            <p>Hi ${fullname},</p>
            <p>
              You have been registered as a staff, Please use link
              below to login and complete the verification process:
            </p>
            <p><button style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
            <a href="http://localhost:5000/admin/reset-password?token=${item}" style="color: white; text-decoration: none;">Login</a>
          </button></p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; Polema. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const generateTokenEmailHTML = (fullname: string, item: number | string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background-color: #fff;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            color: #333;
            margin: 0;
          }
          .content {
            text-align: center;
          }
          .content p {
            font-size: 16px;
            margin: 20px 0;
          }
          .verification-link {
            display: inline-block;
            padding: 10px 20px;
            font-size: 18px;
            color: #fff;
            background-color: #007bff;
            border-radius: 4px;
            text-decoration: none;
          }
          .verification-link:hover {
            background-color: #0056b3;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
          }
          .footer a {
            color: #007bff;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Hi ${fullname},</p>
            <p>Thank you for registering with us. Please click the button below to reset your password:</p>
            <p>
            <button style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
            <a href="http://localhost:5000/admin/reset-password?token=${item}" style="color: white; text-decoration: none;">Verify Email</a>
          </button>

</p>

            <p>If you did not request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; Polema. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
