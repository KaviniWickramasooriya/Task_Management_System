import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOTPEmail } from '../utils/emailUtils.js';

export const register = async (req, res) => {
  const { name, email, password, otp } = req.body;
  if (otp !== '123456') return res.status(400).json({ message: 'Invalid OTP' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(400).json({ message: 'Error', error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.cookie('token', token, { httpOnly: true }).json({ message: 'Login success' });
};

export const sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = '123456';
  await sendOTPEmail(email, otp);
  res.json({ message: 'OTP sent' });
};