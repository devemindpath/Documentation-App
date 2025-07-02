import express from 'express';
import { uploadImages } from '../controllers/uploadController';
import upload from '../middleware/upload';

const router = express.Router();

// POST endpoint for uploading images
router.post('/upload', upload.array('images', 5), uploadImages);

export default router;