import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String,
    required: true
  },
  images: [{
    url: String,
    publicId: String
  }],
  category: { 
    type: String,
    required: true,
    enum: ['Hot Coffee', 'Cold Coffee', 'Desserts', 'Snacks']
  },
  ingredients: [{
    name: String,
    quantity: String
  }],
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    caffeine: Number
  },
  sizes: [{
    name: {
      type: String,
      enum: ['Small', 'Medium', 'Large']
    },
    price: Number
  }],
  available: { 
    type: Boolean, 
    default: true 
  },
  featured: {
    type: Boolean,
    default: false
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  tags: [String]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug before saving
productSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.totalReviews = this.ratings.length;
  }
  return this.save();
};

export default mongoose.model('Product', productSchema);