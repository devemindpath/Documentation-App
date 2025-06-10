import express from 'express';
import { getAllBlogs, getBlogById } from '../controllers/blogController';

const router = express.Router();

// Public routes
router.get('/blogs', getAllBlogs);
router.get('/blogs/:id', getBlogById);

// Protected routes
// router.post('/', createBlog);

export default router; 