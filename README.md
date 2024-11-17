# Advanced Coffee Shop Backend

A feature-rich Node.js backend for a coffee shop e-commerce platform with advanced features including user authentication, product management, analytics, and more.

## Features

### 1. Authentication & Authorization
- User registration and login
- Role-based access control (Admin/User)
- Password reset functionality
- JWT-based authentication

### 2. Product Management
- CRUD operations for coffee products
- Image upload with Cloudinary
- Product categorization
- Product ratings and reviews
- Stock management

### 3. Advanced Search and Filters
- Full-text search across products
- Filter by category, price range, and availability
- AI-powered product recommendations
- Trending products detection

### 4. Marketing Tools
- Dynamic promo codes with various conditions
- Points-based loyalty program
- Multi-tier customer rewards
- Push notifications for deals and updates

### 5. Analytics Dashboard
- Real-time sales tracking
- Customer insights
- Product performance metrics
- Trend analysis

### 6. Admin Features
- Bulk product upload via CSV
- Automated stock alerts
- Sales and revenue analytics
- Customer management

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image storage
- Firebase Admin for notifications
- Web Push for browser notifications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Firebase project (for notifications)

## Environment Variables

Create a `.env` file in the root directory:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=mongodb://localhost:27017/coffee-shop
JWT_SECRET=your_jwt_secret
EMAIL_FROM=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
FIREBASE_PROJECT_ID=your_firebase_project_id
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/fahad0samara/node-Advanced-coffee-shop-backend
cd node-Advanced-coffee-shop-backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/rate` - Rate product

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/analytics/product/:productId` - Get product analytics
- `POST /api/admin/products/bulk-upload` - Bulk upload products

## Data Models

### Product
- Name
- Price
- Description
- Category
- Images
- Ingredients
- Nutrition Info
- Sizes
- Ratings
- Stock Status

### User
- Name
- Email
- Password
- Role
- Loyalty Points
- Order History

### PromoCode
- Code
- Discount Type
- Value
- Usage Limits
- Validity Period

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Node.js community
- MongoDB team
- Express.js contributors
- All other open-source contributors

