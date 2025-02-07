import { Router, RequestHandler } from 'express';
import { 
  login, 
  createInitialAdmin, 
  verifyToken, 
  getSecurityQuestions, 
  updateSettings,
  getRecoveryQuestions,
  verifySecurityAnswers,
  resetPassword
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', login as RequestHandler);
router.post('/setup', createInitialAdmin as RequestHandler);
router.post('/get-recovery-questions', getRecoveryQuestions as RequestHandler);
router.post('/verify-security-answers', verifySecurityAnswers as RequestHandler);
router.post('/reset-password', resetPassword as RequestHandler);

// Protected routes
router.get('/verify', authenticateToken as RequestHandler, verifyToken as RequestHandler);
router.get('/security-questions', authenticateToken as RequestHandler, getSecurityQuestions as RequestHandler);
router.post('/update-settings', authenticateToken as RequestHandler, updateSettings as RequestHandler);

export default router; 