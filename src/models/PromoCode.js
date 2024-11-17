import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  maxDiscount: Number,
  startDate: Date,
  endDate: Date,
  usageLimit: Number,
  usageCount: {
    type: Number,
    default: 0
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [String],
  firstTimeOnly: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

promoCodeSchema.methods.isValid = function(orderAmount, user) {
  const now = new Date();
  return this.active &&
         (!this.startDate || now >= this.startDate) &&
         (!this.endDate || now <= this.endDate) &&
         (!this.usageLimit || this.usageCount < this.usageLimit) &&
         orderAmount >= this.minPurchase;
};

promoCodeSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = this.type === 'percentage' 
    ? orderAmount * (this.value / 100)
    : this.value;
    
  if (this.maxDiscount) {
    discount = Math.min(discount, this.maxDiscount);
  }
  
  return Math.min(discount, orderAmount);
};

export default mongoose.model('PromoCode', promoCodeSchema);