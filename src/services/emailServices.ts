import { SocketAddress } from 'net';

var nodemailer = require('nodemailer');
export async function sendMail(
  subject: string,
  toEmail: string,
  otpText: string
) {
  var transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // upg
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  var mailOptions = {
    from: {
      address: process.env.NODEMAILER_EMAIL,
      name: process.env.NODEMAILER_NAME,
    },
    to: toEmail,
    subject: subject,
    text: otpText,
  };
  console.log(mailOptions);
  transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      throw new Error(error);
    } else {
      console.log('Email Sent');
      return true;
    }
  });
}
