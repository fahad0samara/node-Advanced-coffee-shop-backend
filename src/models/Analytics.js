import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  sales: {
    total: Number,
    byProduct: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      revenue: Number
    }],
    byCategory: [{
      category: String,
      quantity: Number,
      revenue: Number
    }]
  },
  customers: {
    total: Number,
    new: Number,
    returning: Number
  },
  orders: {
    total: Number,
    average: Number,
    cancelled: Number
  },
  products: {
    viewed: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      count: Number
    }],
    searched: [{
      term: String,
      count: Number
    }]
  },
  loyalty: {
    pointsEarned: Number,
    pointsRedeemed: Number,
    newMembers: Number
  }
}, { timestamps: true });

analyticsSchema.statics.recordSale = async function(order) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let analytics = await this.findOne({ date: today });
  if (!analytics) {
    analytics = new this({ date: today });
  }
  
  // Update sales metrics
  analytics.sales.total = (analytics.sales.total || 0) + order.total;
  
  // Update product-specific metrics
  order.items.forEach(item => {
    const productIndex = analytics.sales.byProduct.findIndex(
      p => p.product.equals(item.product)
    );
    
    if (productIndex > -1) {
      analytics.sales.byProduct[productIndex].quantity += item.quantity;
      analytics.sales.byProduct[productIndex].revenue += item.price * item.quantity;
    } else {
      analytics.sales.byProduct.push({
        product: item.product,
        quantity: item.quantity,
        revenue: item.price * item.quantity
      });
    }
  });
  
  await analytics.save();
};

export default mongoose.model('Analytics', analyticsSchema);