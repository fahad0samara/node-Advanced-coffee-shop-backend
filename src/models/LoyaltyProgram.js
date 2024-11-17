import mongoose from 'mongoose';

const loyaltyProgramSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  pointsHistory: [{
    points: Number,
    type: {
      type: String,
      enum: ['earned', 'redeemed']
    },
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  rewards: [{
    type: {
      type: String,
      enum: ['discount', 'freeProduct', 'freeShipping']
    },
    value: mongoose.Schema.Types.Mixed,
    expiryDate: Date,
    used: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

loyaltyProgramSchema.methods.addPoints = async function(points, description) {
  this.points += points;
  this.pointsHistory.push({
    points,
    type: 'earned',
    description
  });
  
  // Update tier based on total points
  if (this.points >= 1000) this.tier = 'Platinum';
  else if (this.points >= 500) this.tier = 'Gold';
  else if (this.points >= 200) this.tier = 'Silver';
  
  await this.save();
};

loyaltyProgramSchema.methods.redeemPoints = async function(points, description) {
  if (this.points < points) {
    throw new Error('Insufficient points');
  }
  
  this.points -= points;
  this.pointsHistory.push({
    points,
    type: 'redeemed',
    description
  });
  
  await this.save();
};

export default mongoose.model('LoyaltyProgram', loyaltyProgramSchema);