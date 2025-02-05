import { Router, RequestHandler } from 'express';
import { getAllImages, uploadImage, updateImage, deleteImages } from '../controllers/gallery.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { upload } from '../utils/file.utils';
import { handleUploadError } from '../middleware/upload.middleware';

const router = Router();

// Public routes
router.get('/images', getAllImages as RequestHandler);

// Protected routes
router.post('/upload', 
  authenticateToken as RequestHandler,
  upload.single('image'),
  handleUploadError as unknown as RequestHandler,
  uploadImage as RequestHandler
);
router.patch('/images/:id', authenticateToken as RequestHandler, updateImage as RequestHandler);
router.delete('/images', authenticateToken as RequestHandler, deleteImages as RequestHandler);

export default router; 