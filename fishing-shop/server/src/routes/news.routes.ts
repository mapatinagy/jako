import { Router, RequestHandler } from 'express';
import { getNewsPosts, getNewsPost, createNewsPost, updateNewsPost, deleteNewsPost } from '../controllers/news.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/posts', getNewsPosts as RequestHandler);
router.get('/posts/:id', getNewsPost as RequestHandler);

// Protected routes
router.post('/posts', authenticateToken as RequestHandler, createNewsPost as RequestHandler);
router.patch('/posts/:id', authenticateToken as RequestHandler, updateNewsPost as RequestHandler);
router.delete('/posts/:id', authenticateToken as RequestHandler, deleteNewsPost as RequestHandler);

export default router; 