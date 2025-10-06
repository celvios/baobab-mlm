import apiService from '../services/api';

let cachedProducts = null;

export const fetchProducts = async () => {
  try {
    const response = await apiService.getProducts();
    if (response && response.products) {
      cachedProducts = response.products;
      return response.products;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products from API:', error);
    return [];
  }
};

export const products = cachedProducts || [];

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
  return allProducts.slice(0, 6);
};