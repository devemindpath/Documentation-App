import express from "express";
import {
  getAllBlogs,
  getBlogById,
  getUserBlogs,
  updateBlog,
} from "../controllers/blogController";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/blogs", getAllBlogs);
router.get("/blogs/:id", getBlogById);

// Protected routes
router.get("/blogs/user/me", authenticateUser, getUserBlogs);
router.put("/blogs/:id", authenticateUser, updateBlog);

export default router;
