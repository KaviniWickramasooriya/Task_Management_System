import express from 'express';
import { createTask, getTasks, updateTask, deleteTask, getTasksByUserId } from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

  router.get('/user/:userId',  getTasksByUserId);

export default router;