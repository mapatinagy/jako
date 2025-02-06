import { Router, RequestHandler } from 'express';
import { getNewsPosts, getNewsPost, createNewsPost, updateNewsPost, deleteNewsPost, uploadNewsImage } from '../controllers/news.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { upload } from '../utils/file.utils';

const router = Router();

// Public routes
router.get('/posts', getNewsPosts as RequestHandler);
router.get('/posts/:id', getNewsPost as RequestHandler);

// Protected routes
router.post('/posts', authenticateToken as RequestHandler, createNewsPost as RequestHandler);
router.patch('/posts/:id', authenticateToken as RequestHandler, updateNewsPost as RequestHandler);
router.delete('/posts/:id', authenticateToken as RequestHandler, deleteNewsPost as RequestHandler);

// Image upload route for news posts
router.post('/upload-image', 
  authenticateToken as RequestHandler,
  upload.array('images', 10), // Allow up to 10 images at once
  uploadNewsImage as RequestHandler
);

export default router; 