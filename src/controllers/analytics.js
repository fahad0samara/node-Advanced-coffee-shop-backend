import Analytics from '../models/Analytics.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    
    // Today's stats
    const todayStats = await Analytics.findOne({
      date: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    });
    
    // Weekly stats
    const weeklyStats = await Analytics.aggregate([
      {
        $match: {
          date: {
            $gte: startOfWeek(today),
            $lte: endOfWeek(today)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$sales.total' },
          totalOrders: { $sum: '$orders.total' },
          totalCustomers: { $sum: '$customers.total' }
        }
      }
    ]);
    
    // Monthly stats
    const monthlyStats = await Analytics.aggregate([
      {
        $match: {
          date: {
            $gte: startOfMonth(today),
            $lte: endOfMonth(today)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$sales.total' },
          totalOrders: { $sum: '$orders.total' },
          totalCustomers: { $sum: '$customers.total' }
        }
      }
    ]);
    
    // Best selling products
    const bestSellers = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Customer insights
    const customerInsights = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      },
      {
        $sort: { totalSpent: -1 }
      }
    ]);
    
    res.json({
      today: todayStats,
      weekly: weeklyStats[0],
      monthly: monthlyStats[0],
      bestSellers,
      customerInsights
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductAnalytics = async (req, res) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate } = req.query;
    
    const productStats = await Analytics.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          'sales.byProduct.product': productId
        }
      },
      {
        $unwind: '$sales.byProduct'
      },
      {
        $match: {
          'sales.byProduct.product': productId
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          quantity: { $sum: '$sales.byProduct.quantity' },
          revenue: { $sum: '$sales.byProduct.revenue' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    res.json(productStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};