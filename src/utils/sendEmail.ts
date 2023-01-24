/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import nodemailer from 'nodemailer';
// @ts-ignore
import sendGridTransport from 'nodemailer-sendgrid-transport';
import { environmentConfig } from '@src/configs/custom-environment-variables.config';

export const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key: environmentConfig.SEND_GRID_API_KEY,
    },
  })
);

let htmlContent = ` <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
        <h2
          style="text-align: center; text-transform: uppercase;color: teal;
            "
        >
          Welcome to Codding With Saddam.
        </h2>
        <div style=" font-size: 1.3rem ">
          <p>Congratulations! You successfully signed up to Saddam App!</p>
          <p> click the button below to flow Saddam on Gitub </p>
          <a
            href="https://github.com/saddamarbaa"
            style="background: crimson; text-decoration: none; color: white; padding: 10px 30px; margin: 10px 0; display: inline-block;  border-radius: 6px;"
          >
            Follow Me
          </a>
          <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        If you have any questions, just reply to this email
                        <span style="color: #4A35EA;">
                          saddamarbaa@gmail.com
                        </span>
                        we're always happy to help out.
                      </p>
        </div>
      </div>`;

export const sendEmail = (userEmail: any) => {
  const emailContent = {
    from: environmentConfig?.ADMIN_SEND_GRID_EMAIL,
    to: userEmail,
    subject: 'Signup succeeded!',
    html: htmlContent,
  };

  transporter.sendMail(emailContent, function (error, _info) {
    if (error) {
      if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
        console.log('Sending Email error:', error);
        console.log('Sending Email error:');
      }
    } else if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
      console.log(`Successfully  send email to ${userEmail}...`);
    }
  });
};

export const sendResetPasswordEmail = (userEmail: string, userName: string, link: string) => {
  htmlContent = `
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email</title>
    <meta name="description" content="Reset Password Email ." />
    <style type="text/css">
      a:hover {
        text-decoration: underline !important;
      }
    </style>
  </head>
  <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table
      cellspacing="0"
      border="0"
      cellpadding="0"
      width="100%"
      bgcolor="#f2f3f8"
      style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;"
    >
      <tr>
        <td>
          <table
            style="background-color: #f2f3f8; max-width:670px;  margin:0 auto; margin:auto; font-size: 110%;"
            width="100%"
            border="0"
            align="center"
            cellpadding="0"
            cellspacing="0"
          >
            <tr>
              <td style="height:80px;">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align:center;">
                <a href="https://rakeshmandal.com" title="logo" target="_blank">
                  <img width="60" src="https://i.ibb.co/hL4XZp2/android-chrome-192x192.png" title="logo" alt="logo" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="height:20px;">&nbsp;</td>
            </tr>
            <tr>
              <td>
                <table
                  width="95%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"
                >
                  <tr>
                    <td
                      style="height:40px; text-align: center; text-transform: uppercase;color: teal; padding: 1.3rem; font-weight:500; margin:0;font-size:23px;font-family:'Rubik',sans-serif;"
                    >
                      HI ${userName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 35px;">
                      <h1
                        style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;"
                      >
                        You have requested to reset your password
                      </h1>
                      <span
                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"
                      ></span>
                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        We cannot simply send you your old password. A unique link to reset your password has been
                        generated for you. To reset your password, Please click the following link and follow the
                        instructions. and If you did not request this, please ignore this email and your password will
                        remain unchanged.
                      </p>
                      <a
                        href=${link}
                        style="background: crimson; text-decoration: none; color: white; padding: 10px 30px; margin: 20px 0; display: inline-block;  border-radius: 6px;"
                      >
                        Reset Password
                      </a>
                       <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        If that doesn't work, copy and paste the following link in your browser:
                      </p>
                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        <a href="${link}" target="_blank" style="color: #4A35EA;"
                          >${link}</a
                        >
                      </p>
                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        If you have any questions, just reply to this email
                        <span style="color: #4A35EA;">
                          saddamarbaa@gmail.com
                        </span>
                        we're always happy to help out.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="height:40px;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:20px;">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align:center;">
                <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                  &copy; <strong>www.saddamarabbaa.com</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="height:80px;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!--/100% body table-->
  </body>
</html>
`;

  const emailContent = {
    from: environmentConfig.ADMIN_SEND_GRID_EMAIL,
    to: userEmail,
    subject: 'Password Change Request',
    html: htmlContent,
  };

  transporter.sendMail(emailContent, function (error, _info) {
    if (error) {
      if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
        console.log('Sending Email error:', error);
        console.log('Sending Email error:');
      }
    } else if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
      console.log(`Successfully  send email to ${userEmail}...`);
    }
  });
};

export const sendConfirmResetPasswordEmail = (userEmail: string, userName: string, link: string) => {
  htmlContent = `
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email</title>
    <meta name="description" content="Reset Password Email ." />
    <style type="text/css">
      a:hover {
        text-decoration: underline !important;
      }
    </style>
  </head>
  <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table
      cellspacing="0"
      border="0"
      cellpadding="0"
      width="100%"
      bgcolor="#f2f3f8"
      style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;"
    >
      <tr>
        <td>
          <table
            style="background-color: #f2f3f8; max-width:670px;  margin:0 auto; margin:auto; font-size: 110%;"
            width="100%"
            border="0"
            align="center"
            cellpadding="0"
            cellspacing="0"
          >
            <tr>
              <td style="height:80px;">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align:center;">
                <a href="https://rakeshmandal.com" title="logo" target="_blank">
                  <img width="60" src="https://i.ibb.co/hL4XZp2/android-chrome-192x192.png" title="logo" alt="logo" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="height:20px;">&nbsp;</td>
            </tr>
            <tr>
              <td>
                <table
                  width="95%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"
                >
                  <tr>
                    <td
                      style="height:40px; text-align: center; text-transform: uppercase;color: teal; padding: 1.3rem; font-weight:500; margin:0;font-size:23px;font-family:'Rubik',sans-serif;"
                    >
                      HI ${userName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 35px;">
                      <h1
                        style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;"
                      >
                        Password Reset Success
                      </h1>
                      <span
                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"
                      ></span>
                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        Your password has been Successfully updated
                      </p>
                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        We're excited to have you get started Just press the button below to login
                      </p>
                      <a
                        href="${link}"
                        style="background:  #3385ff; text-decoration: none; color: white; padding: 10px 30px; margin: 20px 0; display: inline-block;  border-radius: 6px;"
                      >
                        Login
                      </a>
                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        If that doesn't work, copy and paste the following link in your browser:
                      </p>
                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        <a href="${link}" target="_blank" style="color: #4A35EA;"
                          >${link}</a
                        >
                      </p>
                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        If you have any questions, just reply to this email
                        <span style="color: #4A35EA;">
                          saddamarbaa@gmail.com
                        </span>
                        we're always happy to help out.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="height:40px;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:20px;">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align:center;">
                <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                  &copy; <strong>www.saddamarabbaa.com</strong>
                </p>
                
              </td>
            </tr>
            <tr>
              <td style="height:80px;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!--/100% body table-->
  </body>
</html>
`;

  const emailContent = {
    from: environmentConfig.ADMIN_SEND_GRID_EMAIL,
    to: userEmail,
    subject: 'Password Reset Success',
    html: htmlContent,
  };

  transporter.sendMail(emailContent, function (error, _info) {
    if (error) {
      if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
        console.log('Sending Email error:', error);
      }
    } else if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
      console.log(`Successfully  send email to ${userEmail}...`);
    }
  });
};

export const sendEmailVerificationEmail = (userEmail: string, userName: string, link: string) => {
  htmlContent = `
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>email verification</title>
    <meta name="description" content="Reset Password Email ." />
    <style type="text/css">
      a:hover {
        text-decoration: underline !important;
      }
    </style>
  </head>
  <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table
      cellspacing="0"
      border="0"
      cellpadding="0"
      width="100%"
      bgcolor="#f2f3f8"
      style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;"
    >
      <tr>
        <td>
          <table
            style="background-color: #f2f3f8; max-width:670px;  margin:0 auto; margin:auto; font-size: 110%;"
            width="100%"
            border="0"
            align="center"
            cellpadding="0"
            cellspacing="0"
          >
            <tr>
              <td style="height:80px;">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align:center;">
                <a href="https://rakeshmandal.com" title="logo" target="_blank">
                  <img width="60" src="https://i.ibb.co/hL4XZp2/android-chrome-192x192.png" title="logo" alt="logo" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="height:20px;">&nbsp;</td>
            </tr>
            <tr>
              <td>
                <table
                  width="95%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"
                >
                  <tr>
                    <td
                      style="height:40px; text-align: center; text-transform: uppercase;color: teal; padding: 1.3rem; font-weight:500; margin:0;font-size:23px;font-family:'Rubik',sans-serif;"
                    >
                      HI ${userName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 35px;">
                      <h1
                        style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;"
                      >
                        Confirm Your Email Address
                      </h1>
                      <span
                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"
                      ></span>
                      <p style="color:#455056; font-size:15px;">
                        Kindly verify your email to complete your account registration.
                      </p>
                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        You are just one step away please click the button below to verify your email. and If you
                        received this email by mistake, simply delete it. You won't be subscribed if you don't click the
                        confirmation link blow.
                      </p>
                      <a
                        href="${link}"
                        style="background:  #1a82e2; text-decoration: none; color: white; padding: 10px 30px; margin: 20px 0; display: inline-block;  border-radius: 6px;"
                      >
                        Confirm email
                      </a>
                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        If that doesn't work, copy and paste the following link in your browser:
                      </p>
                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        <a href="${link}" target="_blank" style="color: #4A35EA;">${link}</a>
                      </p>
                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        If you have any questions, just reply to this email
                        <span style="color: #4A35EA;">
                          saddamarbaa@gmail.com
                        </span>
                        we're always happy to help out.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="height:40px;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:20px;">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align:center;">
                <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                  &copy; <strong>www.saddamarabbaa.com</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="height:80px;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!--/100% body table-->
  </body>
</html>
`;

  const emailContent = {
    from: environmentConfig.ADMIN_SEND_GRID_EMAIL,
    to: userEmail,
    subject: 'Email Verification',
    html: htmlContent,
  };

  transporter.sendMail(emailContent, function (error, _info) {
    if (error) {
      if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
        console.log('Sending Email error:', error);
        console.log('Sending Email error:');
      }
    } else if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
      console.log(`Successfully  send email to ${userEmail}...`);
    }
  });
};

export default { sendEmailVerificationEmail, sendEmail, sendResetPasswordEmail, sendConfirmResetPasswordEmail };
