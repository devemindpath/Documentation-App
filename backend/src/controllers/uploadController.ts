import { Request, Response } from 'express';
import { supabase, bucketName } from '../config/supabase';
import fs from 'fs';
import path from 'path';
import { UploadResponse } from '../types';

export const uploadImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded',
      } as UploadResponse);
      return;
    }

    const files = req.files as Express.Multer.File[];
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const filePath = path.resolve(file.path);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Generate a unique filename
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${file.originalname}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(uniqueFilename, fileBuffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        throw new Error(`Error uploading file to Supabase: ${error.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uniqueFilename);

      uploadedUrls.push(urlData.publicUrl);

      // Clean up the local file
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      urls: uploadedUrls,
    } as UploadResponse);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during upload',
    } as UploadResponse);
  }
};