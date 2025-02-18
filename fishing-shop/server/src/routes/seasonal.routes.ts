import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  toggleProductStatus,
  uploadProductImage
} from '../controllers/seasonal.controller';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: 'uploads/seasonal/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'seasonal-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Protected routes (require authentication)
router.get('/', getAllProducts);
router.post('/', authenticateToken, upload.single('image'), createProduct);
router.patch('/:id', authenticateToken, upload.single('image'), updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);
router.patch('/:id/toggle', authenticateToken, toggleProductStatus);
router.post('/upload', authenticateToken, upload.single('image'), uploadProductImage);

export default router; 