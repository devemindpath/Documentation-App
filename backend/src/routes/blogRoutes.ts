import express from 'express';
import { getAllBlogs, getBlogById, getUserBlogs } from '../controllers/blogController';
import { authenticateUser } from '../middleware/auth';


const router = express.Router();

// Public routes
router.get('/blogs', getAllBlogs);
router.get('/blogs/:id', getBlogById);

// Protected routes
router.get('/blogs/user/me', authenticateUser, getUserBlogs);

export default router; 