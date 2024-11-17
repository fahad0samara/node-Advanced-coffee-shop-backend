import Product from '../models/Product.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import fs from 'fs/promises';

export const getAllProducts = async (req, res) => {
  try {
    const { 
      category, 
      featured, 
      minPrice, 
      maxPrice, 
      sort = '-createdAt',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('ratings.user', 'name');

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(async (file) => {
        const result = await uploadImage(file);
        await fs.unlink(file.path); // Clean up uploaded file
        return result;
      });
      
      productData.images = await Promise.all(imagePromises);
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    // Clean up uploaded files if there's an error
    if (req.files) {
      await Promise.all(req.files.map(file => fs.unlink(file.path)));
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productData = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      await Promise.all(product.images.map(img => deleteImage(img.publicId)));

      // Upload new images
      const imagePromises = req.files.map(async (file) => {
        const result = await uploadImage(file);
        await fs.unlink(file.path);
        return result;
      });
      
      productData.images = await Promise.all(imagePromises);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    if (req.files) {
      await Promise.all(req.files.map(file => fs.unlink(file.path)));
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary
    await Promise.all(product.images.map(img => deleteImage(img.publicId)));
    
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already rated
    const existingRating = product.ratings.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
    } else {
      product.ratings.push({
        user: req.user._id,
        rating,
        review
      });
    }

    await product.calculateAverageRating();
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};