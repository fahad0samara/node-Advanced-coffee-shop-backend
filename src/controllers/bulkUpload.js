import { parse } from 'csv-parse';
import fs from 'fs/promises';
import Product from '../models/Product.js';
import { uploadImage } from '../config/cloudinary.js';

export const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file provided' });
    }

    const fileContent = await fs.readFile(req.file.path, 'utf-8');
    const records = await new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });

    const results = {
      success: [],
      errors: []
    };

    for (const record of records) {
      try {
        // Transform CSV data to match Product schema
        const productData = {
          name: record.name,
          price: parseFloat(record.price),
          description: record.description,
          category: record.category,
          ingredients: record.ingredients.split(',').map(ingredient => ({
            name: ingredient.trim(),
            quantity: record.ingredientQuantities.split(',')[
              record.ingredients.split(',').indexOf(ingredient.trim())
            ]
          })),
          nutritionInfo: {
            calories: parseInt(record.calories),
            protein: parseFloat(record.protein),
            carbohydrates: parseFloat(record.carbohydrates),
            fat: parseFloat(record.fat),
            caffeine: parseInt(record.caffeine)
          },
          sizes: record.sizes.split(',').map((size, index) => ({
            name: size.trim(),
            price: parseFloat(record.sizePrices.split(',')[index])
          })),
          available: record.available === 'true',
          featured: record.featured === 'true',
          tags: record.tags.split(',').map(tag => tag.trim())
        };

        // Handle image URLs if provided
        if (record.imageUrls) {
          const imageUrls = record.imageUrls.split(',');
          const imagePromises = imageUrls.map(async url => {
            const response = await fetch(url);
            const buffer = await response.buffer();
            const tempPath = `temp-${Date.now()}.jpg`;
            await fs.writeFile(tempPath, buffer);
            
            const result = await uploadImage({ path: tempPath });
            await fs.unlink(tempPath);
            return result;
          });

          productData.images = await Promise.all(imagePromises);
        }

        const product = await Product.create(productData);
        results.success.push({
          name: product.name,
          id: product._id
        });
      } catch (error) {
        results.errors.push({
          name: record.name,
          error: error.message
        });
      }
    }

    // Clean up the uploaded CSV file
    await fs.unlink(req.file.path);

    res.json({
      message: 'Bulk upload completed',
      results
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};