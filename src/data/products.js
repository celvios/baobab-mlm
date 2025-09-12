export const products = [
  {
    id: 1,
    name: 'Lentoc Tea',
    description: 'A revitalizing herbal infusion blending powerful botanicals for total-body wellness and natural energy boost.',
    price: 3000,
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
    price: 3000,
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
    price: 6000,
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
    price: 4000,
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
    price: 4000,
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
    price: 2500,
    image: '/images/6241b2d41327941b39683db0_Peach%20Gradient%20Image%20(1)-p-800.png',
    bgColor: 'from-red-100 to-pink-100',
    category: 'Beverages',
    inStock: true,
    benefits: ['Strengthens immunity', 'Supports heart & digestive health', 'Improves memory & brain function', 'Reduces inflammation & cholesterol', 'Promotes glowing skin']
  },
  {
    id: 7,
    name: 'Baobab + Moringa + Ginger Powder',
    description: 'A triple superfood blend for energy, immunity, and digestion.',
    price: 3500,
    image: '/images/leaf-1.png',
    bgColor: 'from-green-100 to-lime-100',
    category: 'Supplements',
    inStock: true,
    benefits: ['Vitamin-rich and mineral-dense', 'Anti-inflammatory & antioxidant powerhouse', 'Supports blood sugar balance', 'Enhances metabolism & digestion', 'Sustained energy release']
  },
  {
    id: 8,
    name: 'Baobab Body Lotion',
    description: 'Luxurious body lotion enriched with baobab oil for all-day moisture and skin protection.',
    price: 4500,
    image: '/images/leaf-3.png',
    bgColor: 'from-blue-100 to-cyan-100',
    category: 'Skincare',
    inStock: true,
    benefits: ['24-hour hydration', 'Fast absorption', 'Anti-aging formula', 'Suitable for sensitive skin']
  },
  {
    id: 9,
    name: 'Baobab Hair Oil',
    description: 'Nourishing hair oil with pure baobab extract for stronger, shinier, and healthier hair.',
    price: 3800,
    image: '/images/Intersect.png',
    bgColor: 'from-yellow-100 to-amber-100',
    category: 'Beauty',
    inStock: true,
    benefits: ['Strengthens hair follicles', 'Adds natural shine', 'Reduces hair breakage', 'Promotes hair growth']
  },
  {
    id: 10,
    name: 'Baobab Energy Capsules',
    description: 'Concentrated baobab extract in convenient capsule form for daily wellness support.',
    price: 5000,
    image: '/images/IMG_4996 2.png',
    bgColor: 'from-orange-100 to-red-100',
    category: 'Supplements',
    inStock: true,
    benefits: ['Convenient daily dose', 'High potency formula', 'Boosts energy levels', 'Supports immune system']
  }
];

export const getProductById = (id) => {
  return products.find(product => product.id === parseInt(id));
};

export const getProductsByCategory = (category) => {
  return products.filter(product => product.category === category);
};

export const getFeaturedProducts = () => {
  return products.slice(0, 2);
};