import express from 'express';
import { loginUser, signupUser, googleLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', signupUser);
router.post('/google', googleLogin);  

export default router;
