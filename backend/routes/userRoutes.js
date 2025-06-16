import express from 'express';
import { getUsers, updateUser, deactivateUser, getUserProfile } from '../controllers/userController.js';
const router = express.Router();

router.get('/', getUsers);
router.put('/:id', updateUser);
router.get('/profile/:id', getUserProfile);
router.put('/deactivate/:id', deactivateUser);

export default router;