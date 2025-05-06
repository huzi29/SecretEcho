import express from 'express';
import messageController from '../controllers/messageController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, messageController.sendMessage);
router.get('/', protect, messageController.getMessages);
router.get('/:userId', protect, messageController.getMessagesByID);

export default router;
