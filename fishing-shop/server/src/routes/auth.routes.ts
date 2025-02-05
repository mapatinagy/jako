import { Router, RequestHandler } from 'express';
import { login, createInitialAdmin } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login as RequestHandler);
router.post('/setup', createInitialAdmin as RequestHandler);

export default router; 