import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', authController.register);
router.post('/login', authController.login);
router.get('/users', authController.getAllUsers);


export default router;
