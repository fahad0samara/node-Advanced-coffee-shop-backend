import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getPersonalizedRecommendations = async (userId) => {
  // Get user's purchase history
  const userOrders = await Order.find({ user: userId })
    .populate('items.product');
    
  // Extract categories and products user has bought
  const userPreferences = userOrders.reduce((prefs, order) => {
    order.items.forEach(item => {
      prefs.categories[item.product.category] = 
        (prefs.categories[item.product.category] || 0) + 1;
      prefs.products.add(item.product._id.toString());
    });
    return prefs;
  }, { categories: {}, products: new Set() });
  
  // Find similar products in preferred categories
  const recommendations = await Product.find({
    category: { $in: Object.keys(userPreferences.categories) },
    _id: { $nin: Array.from(userPreferences.products) },
    available: true
  })
  .sort('-averageRating')
  .limit(10);
  
  return recommendations;
};

export const getTrendingProducts = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const trendingProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.product',
        totalOrders: { $sum: 1 },
        totalQuantity: { $sum: '$items.quantity' }
      }
    },
    {
      $sort: { totalOrders: -1 }
    },
    {
      $limit: 10
    }
  ]);
  
  return Product.find({
    _id: { $in: trendingProducts.map(p => p._id) }
  });
};

export const getCollaborativeRecommendations = async (userId) => {
  // Find users with similar purchase patterns
  const userOrders = await Order.find({ user: userId });
  const userProducts = new Set(
    userOrders.flatMap(order => 
      order.items.map(item => item.product.toString())
    )
  );
  
  // Find orders containing these products from other users
  const similarUsers = await Order.aggregate([
    {
      $match: {
        user: { $ne: userId },
        'items.product': { $in: Array.from(userProducts) }
      }
    },
    {
      $group: {
        _id: '$user',
        commonProducts: { $sum: 1 }
      }
    },
    {
      $sort: { commonProducts: -1 }
    },
    {
      $limit: 10
    }
  ]);
  
  // Get products bought by similar users
  const similarUserProducts = await Order.find({
    user: { $in: similarUsers.map(u => u._id) }
  })
  .distinct('items.product');
  
  return Product.find({
    _id: { 
      $in: similarUserProducts,
      $nin: Array.from(userProducts)
    },
    available: true
  })
  .sort('-averageRating')
  .limit(10);
};