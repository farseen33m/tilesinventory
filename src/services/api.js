// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchBrands = () => api.get('/brands/');
export const fetchCategories = () => api.get('/categories/');
export const fetchProducts = () => api.get('/products/');
export const createProduct = (data) => api.post('/products/', data);
export const fetchInventory = () => api.get('/inventory/');
export const fetchLocations = () => api.get('/locations/');
export const fetchStockMovements = () => api.get('/stock-movements/');
export const createStockMovement = (data) => api.post('/stock-movements/', data);
// src/services/api.js
export const deleteProduct = (id) => api.delete(`/products/${id}/`);

//new
export const createInventory = (data) => api.post('/inventory/', data);
export const deleteInventory = (id) => api.delete(`/inventory/${id}/`);

// src/services/api.js

export const updateStockMovement = (id, data) => api.put(`/stock-movements/${id}/`, data);
export const deleteStockMovement = (id) => api.delete(`/stock-movements/${id}/`);