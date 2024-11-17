import express from 'express';
import { register, login, forgotPassword } from '../controllers/auth.js';

export const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);