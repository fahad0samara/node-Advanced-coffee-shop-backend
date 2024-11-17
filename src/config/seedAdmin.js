import User from '../models/User.js';
import Product from '../models/Product.js';

export const seedAdmin = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@coffeeshop.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@coffeeshop.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created successfully');
    }

    // Add some initial coffee products
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      const products = [
        {
          name: 'Espresso',
          price: 3.50,
          description: 'Strong and concentrated coffee shot',
          category: 'Hot Coffee',
          available: true
        },
        {
          name: 'Cappuccino',
          price: 4.50,
          description: 'Espresso with steamed milk and foam',
          category: 'Hot Coffee',
          available: true
        },
        {
          name: 'Iced Latte',
          price: 4.75,
          description: 'Espresso with cold milk and ice',
          category: 'Cold Coffee',
          available: true
        }
      ];

      await Product.insertMany(products);
      console.log('Initial products added successfully');
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
};