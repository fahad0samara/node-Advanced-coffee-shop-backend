import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import connectDB from './config/db.js';
import { seedAdmin } from './config/seedAdmin.js';
import { router as authRoutes } from './routes/auth.js';
import { router as productRoutes } from './routes/product.js';
import { router as adminRoutes } from './routes/admin.js';
import { checkLowStock } from './services/inventory.js';
import { processAnalytics } from './services/analytics.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB and seed admin
connectDB().then(() => {
  seedAdmin();
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Schedule tasks
cron.schedule('0 * * * *', checkLowStock); // Check stock every hour
cron.schedule('0 0 * * *', processAnalytics); // Process analytics daily

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Coffee Shop API running on port ${PORT}`);
});