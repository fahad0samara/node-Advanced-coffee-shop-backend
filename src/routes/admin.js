import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { bulkUploadProducts } from '../controllers/bulkUpload.js';
import { getDashboardStats, getProductAnalytics } from '../controllers/analytics.js';

export const router = express.Router();

// Analytics routes
router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/analytics/product/:productId', protect, adminOnly, getProductAnalytics);

// Bulk upload route
router.post(
  '/products/bulk-upload',
  protect,
  adminOnly,
  upload.single('file'),
  bulkUploadProducts
);