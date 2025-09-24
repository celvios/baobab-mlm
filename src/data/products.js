import apiService from '../services/api';
import currencyService from '../services/currencyService';

// Fallback products for when API is unavailable
const fallbackProducts = [
  {
    id: 1,
    name: 'Lentoc Tea',
    description: 'A revitalizing herbal infusion blending powerful botanicals for total-body wellness and natural energy boost.',
    basePrice: 20, // USD base price
    price: 20, // Will be converted to local currency
    image: '/images/IMG_4996 2.png',
    bgColor: 'from-pink-100 to-orange-100',
    category: 'Beverages',
    inStock: true,
    benefits: ['Natural energy boost', 'Antioxidant rich', 'Digestive support', 'Immune system enhancement']
  },
  {
    id: 2,
    name: 'Baobab Fruit Powder',
    description: 'A tangy, versatile powder to upgrade your smoothies, baked goods and meals with superfood nutrition.',
    basePrice: 20, // USD base price
    price: 20, // Will be converted to local currency
    image: '/images/IMG_4996 2.png',
    bgColor: 'from-amber-100 to-yellow-100',
    category: 'Supplements',
    inStock: true,
    benefits: ['High in Vitamin C', 'Rich in fiber', 'Antioxidant properties', 'Natural energy source']
  },
  {
    id: 3,
    name: 'Baobab Lip Gloss',
    description: 'Nourishing lip gloss infused with baobab oil for smooth, hydrated and naturally glossy lips.',
    basePrice: 40, // USD base price
    price: 40, // Will be converted to local currency
    image: '/images/IMG_4996 2.png',
    bgColor: 'from-rose-100 to-pink-100',
    category: 'Beauty',
    inStock: true,
    benefits: ['Deep moisturization', 'Natural shine', 'Long-lasting formula', 'Baobab oil enriched']
  },
  {
    id: 4,
    name: 'Baobab Natural Soap',
    description: 'Gentle cleansing soap made with pure baobab oil for soft, nourished and healthy-looking skin.',
    basePrice: 25, // USD base price
    price: 25, // Will be converted to local currency
    image: '/images/IMG_4996 2.png',
    bgColor: 'from-green-100 to-emerald-100',
    category: 'Skincare',
    inStock: true,
    benefits: ['Gentle cleansing', 'Moisturizing properties', 'Natural ingredients', 'Suitable for all skin types']
  },
  {
    id: 5,
    name: 'Baobab Facial Oil',
    description: 'Premium facial oil extracted from baobab seeds for deep nourishment and anti-aging benefits.',
    basePrice: 25, // USD base price
    price: 25, // Will be converted to local currency
    image: '/images/IMG_4996 2.png',
    bgColor: 'from-purple-100 to-violet-100',
    category: 'Skincare',
    inStock: true,
    benefits: ['Anti-aging properties', 'Deep hydration', 'Skin regeneration', 'Natural glow enhancement']
  },
  {
    id: 6,
    name: 'Baobab & Mixed Berries Juice',
    description: 'A refreshing antioxidant-packed drink with a fusion of baobab and nutrient-rich berries.',
    basePrice: 15, // USD base price
    price: 15, // Will be converted to local currency
    image: '/images/6241b2d41327941b39683db0_Peach%20Gradient%20Image%20(1)-p-800.png',
    bgColor: 'from-red-100 to-pink-100',
    category: 'Beverages',
    inStock: true,
    benefits: ['Strengthens immunity', 'Supports heart & digestive health', 'Improves memory & brain function', 'Reduces inflammation & cholesterol', 'Promotes glowing skin']
  }
];

let cachedProducts = null;

export const fetchProducts = async () => {
  try {
    const response = await apiService.request('/products');
    const products = response.products || response;
    
    // Initialize currency service if not already done
    await currencyService.initialize();
    
    // Transform API products to match expected format with currency conversion
    const transformedProducts = await Promise.all(products.map(async (product, index) => {
      const convertedPrice = await currencyService.convertPrice(product.basePrice || product.price || 20);
      
      return {
        id: product.id,
        name: product.name || product.product_name,
        description: product.description,
        basePrice: product.basePrice || product.price || 20, // USD price
        price: Math.round(convertedPrice), // Local currency price
        localPrice: currencyService.formatPrice(convertedPrice),
        image: product.image || '/images/IMG_4996 2.png',
        bgColor: fallbackProducts[index % fallbackProducts.length]?.bgColor || 'from-gray-100 to-gray-200',
        category: product.category || 'General',
        inStock: product.in_stock !== false,
        benefits: product.benefits || ['Health benefits', 'Natural ingredients']
      };
    }));
    
    cachedProducts = transformedProducts;
    return transformedProducts;
  } catch (error) {
    console.error('Failed to fetch products from API:', error);
    // Convert fallback products to local currency
    const convertedFallback = await Promise.all(fallbackProducts.map(async (product) => {
      const convertedPrice = await currencyService.convertPrice(product.basePrice);
      return {
        ...product,
        price: Math.round(convertedPrice),
        localPrice: currencyService.formatPrice(convertedPrice)
      };
    }));
    return convertedFallback;
  }
};

export const products = cachedProducts || fallbackProducts;

export const getProductById = async (id) => {
  const allProducts = await fetchProducts();
  return allProducts.find(product => product.id === parseInt(id));
};

export const getProductsByCategory = async (category) => {
  const allProducts = await fetchProducts();
  return allProducts.filter(product => product.category === category);
};

export const getFeaturedProducts = async () => {
  const allProducts = await fetchProducts();
  return allProducts.slice(0, 2);
};

// Helper function to get products with converted prices
export const getProductsWithLocalPrices = async () => {
  return await fetchProducts();
};