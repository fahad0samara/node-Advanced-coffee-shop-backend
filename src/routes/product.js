import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addRating
} from '../controllers/product.js';

export const router = express.Router();

router.get('/', getAllProducts);
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/rate', protect, addRating);