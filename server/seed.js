import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';

// Load environment variables
dotenv.config();

// Sample data
const sampleSellers = [
  {
    name: 'Jane Fashion',
    email: 'jane@example.com',
    password: 'password123',
    role: 'seller',
    phone: '+254712345678',
    isVerified: true,
  },
  {
    name: 'Mike Thrift',
    email: 'mike@example.com',
    password: 'password123',
    role: 'seller',
    phone: '+254723456789',
    isVerified: true,
  },
  {
    name: 'Sarah Vintage',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'seller',
    phone: '+254734567890',
    isVerified: true,
  }
];

const sampleProducts = [
  {
    name: 'Vintage Levi\'s Denim Jacket',
    description: 'Classic 90s Levi\'s denim jacket in excellent condition. Perfect for layering and has that authentic vintage look. Size M, fits true to size.',
    price: 2500,
    category: 'outerwear',
    condition: 'good',
    size: 'M',
    tags: ['vintage', 'denim', 'levis', '90s', 'jacket'],
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'],
  },
  {
    name: 'Designer Handbag - Gucci Inspired',
    description: 'Beautiful designer-inspired handbag in black leather. Excellent craftsmanship with gold hardware. Perfect for everyday use or special occasions.',
    price: 4500,
    category: 'accessories',
    condition: 'like-new',
    tags: ['designer', 'handbag', 'leather', 'gucci', 'luxury'],
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
  },
  {
    name: 'Retro Nike Air Jordans',
    description: 'Classic Nike Air Jordan sneakers from the 90s. Iconic design with the famous Jumpman logo. Size 10, worn but well-maintained.',
    price: 3200,
    category: 'shoes',
    condition: 'good',
    size: '10',
    tags: ['nike', 'jordans', 'sneakers', 'retro', '90s'],
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'],
  },
  {
    name: 'Floral Maxi Dress',
    description: 'Beautiful floral print maxi dress, perfect for summer. Flowy fabric, comfortable fit. Size S, can be worn casually or dressed up.',
    price: 1800,
    category: 'dresses',
    condition: 'like-new',
    size: 'S',
    tags: ['dress', 'floral', 'maxi', 'summer', 'casual'],
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
  },
  {
    name: 'Vintage Band T-Shirt Collection',
    description: 'Set of 3 vintage band t-shirts from the 80s and 90s. Includes Metallica, Nirvana, and Guns N\' Roses. All in excellent condition.',
    price: 1200,
    category: 'tops',
    condition: 'good',
    size: 'L',
    tags: ['vintage', 'band', 't-shirt', '80s', '90s', 'rock'],
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
  },
  {
    name: 'Designer Sunglasses - Ray-Ban',
    description: 'Authentic Ray-Ban aviator sunglasses. Classic gold frame with green lenses. Comes with original case and cleaning cloth.',
    price: 2800,
    category: 'accessories',
    condition: 'like-new',
    tags: ['sunglasses', 'ray-ban', 'designer', 'aviator', 'luxury'],
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'],
  },
  {
    name: 'High-Waisted Jeans',
    description: 'Trendy high-waisted mom jeans in dark wash. Perfect fit, comfortable stretch fabric. Size 28, in excellent condition.',
    price: 1600,
    category: 'bottoms',
    condition: 'like-new',
    size: '28',
    tags: ['jeans', 'high-waisted', 'mom-jeans', 'trendy', 'comfortable'],
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'],
  },
  {
    name: 'Vintage Leather Boots',
    description: 'Genuine leather ankle boots with slight western styling. Comfortable for all-day wear. Size 8, well-maintained with minor wear.',
    price: 2900,
    category: 'shoes',
    condition: 'good',
    size: '8',
    tags: ['boots', 'leather', 'vintage', 'western', 'comfortable'],
    images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400'],
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({ email: { $in: sampleSellers.map(s => s.email) } });
    await Product.deleteMany({});
    console.log('🧹 Cleared existing sample data');

    // Create sellers
    const createdSellers = [];
    for (const sellerData of sampleSellers) {
      const seller = await User.create(sellerData);
      createdSellers.push(seller);
      console.log(`👤 Created seller: ${seller.name}`);
    }

    // Create products
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      const seller = createdSellers[i % createdSellers.length]; // Distribute products among sellers

      const product = await Product.create({
        ...productData,
        seller: seller._id,
      });

      console.log(`📦 Created product: ${product.name} by ${seller.name}`);
    }

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created ${createdSellers.length} sellers and ${sampleProducts.length} products`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed function
seedDatabase();