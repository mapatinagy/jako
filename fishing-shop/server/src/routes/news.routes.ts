import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getNewsPosts, getNewsPost, createNewsPost, updateNewsPost, deleteNewsPost, uploadNewsImage, togglePublishStatus } from '../controllers/news.controller';
import { upload } from '../utils/file.utils';

const router = Router();

// Public routes (no authentication required)
router.get('/posts', getNewsPosts as RequestHandler);
router.get('/posts/:id', getNewsPost as RequestHandler);

// Protected routes (require authentication)
router.post('/posts', authenticateToken as RequestHandler, createNewsPost as RequestHandler);
router.patch('/posts/:id', authenticateToken as RequestHandler, updateNewsPost as RequestHandler);
router.delete('/posts/:id', authenticateToken as RequestHandler, deleteNewsPost as RequestHandler);
router.post('/upload-image', authenticateToken as RequestHandler, upload.array('images'), uploadNewsImage as RequestHandler);
router.patch('/posts/:id/toggle-publish', authenticateToken as RequestHandler, togglePublishStatus as RequestHandler);

export default router; 