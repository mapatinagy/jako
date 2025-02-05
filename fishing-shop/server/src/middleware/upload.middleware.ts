import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import multer from 'multer';

export const handleUploadError: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
    return next();
  }

  if (err.message.includes('Invalid file type')) {
    res.status(400).json({
      success: false,
      message: err.message
    });
    return next();
  }

  console.error('Upload error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred during file upload'
  });
  return next();
}; 