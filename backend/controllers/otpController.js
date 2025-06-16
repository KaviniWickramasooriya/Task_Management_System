// import nodemailer from 'nodemailer';
// import crypto from 'crypto';
// import dotenv from 'dotenv';

// dotenv.config();
// const otpStore = {}; // Temporary in-memory OTP store



// console.log('EMAIL_USER:', process.env.EMAIL_USER);
// console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '******' : 'MISSING');

// // Generate and send OTP
// export const sendOTP = (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ message: 'Email is required' });

//   const otp = crypto.randomInt(100000, 999999).toString();
//   otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 minutes expiry

//   // Configure nodemailer transporter
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//     debug: true,
//     logger: true,
//     tls: {
//     rejectUnauthorized: false,  // Accept self-signed certs
//   },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Your OTP Code',
//     html: `<h3>Your OTP is: <b>${otp}</b></h3><p>It will expire in 5 minutes.</p>`,
//   };

//   // Send mail with promise handling
//   transporter.sendMail(mailOptions)
//     .then(info => {
//       console.log('Email sent:', info.response);
//       res.status(200).json({ message: 'OTP sent successfully' });
//     })
//     .catch(error => {
//       console.error('Error sending email:', error);
//       res.status(500).json({ message: 'Failed to send OTP' });
//     });
// };

// // Verify OTP
// export const verifyOTP = (req, res) => {
//   const { email, otp } = req.body;
//   if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

//   const stored = otpStore[email];
//   if (!stored) return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });

//   if (Date.now() > stored.expiresAt) {
//     delete otpStore[email];
//     return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
//   }

//   if (stored.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

//   delete otpStore[email]; // Remove OTP after successful verification
//   res.status(200).json({ message: 'OTP verified' });
// };

import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Hardcoded email credentials (replace with your actual email and app password)
const EMAIL_USER = 'kaviniwickramasooriya@gmail.com';
const EMAIL_PASS = 'iabcttdgiwxffzhs';

const otpStore = {}; // Temporary in-memory OTP store

console.log('Using hardcoded EMAIL_USER:', EMAIL_USER);
console.log('Using hardcoded EMAIL_PASS:', EMAIL_PASS ? '******' : 'MISSING');

// Generate and send OTP
export const sendOTP = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 minutes expiry

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    debug: true,
    logger: true,
    tls: {
      rejectUnauthorized: false,  // Accept self-signed certs
    },
  });

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    html: `<h3>Your OTP is: <b>${otp}</b></h3><p>It will expire in 5 minutes.</p>`,
  };

  // Send mail with promise handling
  transporter.sendMail(mailOptions)
    .then(info => {
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'OTP sent successfully' });
    })
    .catch(error => {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send OTP' });
    });
};

// Verify OTP
export const verifyOTP = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  const stored = otpStore[email];
  if (!stored) return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });

  if (Date.now() > stored.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
  }

  if (stored.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  delete otpStore[email]; // Remove OTP after successful verification
  res.status(200).json({ message: 'OTP verified' });
};

