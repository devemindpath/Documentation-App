import express from 'express';
import { addUserData, getUserByEmail, healthCheck } from '../controllers/userController';

const router = express.Router();

// POST endpoint for adding user data after sign-in
router.post('/user', addUserData);

// GET endpoint for retrieving user data by email
router.get('/user', getUserByEmail);

// GET endpoint for health check
router.get('/user/health', healthCheck);

export default router;