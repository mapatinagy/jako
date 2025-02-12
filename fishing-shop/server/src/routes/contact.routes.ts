import express from 'express';
import { sendContactEmail } from '../controllers/contact.controller';

const router = express.Router();

router.post('/send', sendContactEmail);

export default router; 