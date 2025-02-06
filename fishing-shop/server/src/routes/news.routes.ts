import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getNewsPosts, getNewsPost, createNewsPost, updateNewsPost, deleteNewsPost, uploadNewsImage, togglePublishStatus } from '../controllers/news.controller';
import { upload } from '../utils/file.utils';

const router = Router();

// Protected routes (require authentication)
router.get('/posts', authenticateToken, getNewsPosts);
router.post('/posts', authenticateToken, createNewsPost);
router.patch('/posts/:id', authenticateToken, updateNewsPost);
router.delete('/posts/:id', authenticateToken, deleteNewsPost);
router.post('/upload-image', authenticateToken, upload.array('images'), uploadNewsImage);
router.patch('/posts/:id/toggle-publish', authenticateToken, togglePublishStatus);

// Public routes
router.get('/posts/:id', getNewsPost);

export default router; 