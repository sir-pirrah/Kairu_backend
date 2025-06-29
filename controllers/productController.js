const fs = require('fs-extra');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

// Helper function to read products data
const readProductsData = async () => {
  try {
    const data = await fs.readJson(PRODUCTS_FILE);
    return data;
  } catch (error) {
    console.error('Error reading products file:', error);
    throw new Error('Failed to read products data');
  }
};

// Helper function to write products data
const writeProductsData = async (data) => {
  try {
    await fs.writeJson(PRODUCTS_FILE, data, { spaces: 2 });
  } catch (error) {
    console.error('Error writing products file:', error);
    throw new Error('Failed to write products data');
  }
};

// Helper function to generate unique ID
const generateId = (products) => {
  const maxId = Math.max(...products.map(p => parseInt(p.id) || 0), 0);
  return String(maxId + 1);
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const data = await readProductsData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const data = await readProductsData();
    const newProduct = {
      ...req.body,
      id: generateId(data.products),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Set default values for optional fields
    newProduct.stock = newProduct.stock || 0;
    newProduct.rating = newProduct.rating || 0;
    newProduct.reviewCount = newProduct.reviewCount || 0;
    newProduct.isNew = newProduct.isNew || false;
    newProduct.isFeatured = newProduct.isFeatured || false;
    newProduct.isTopPick = newProduct.isTopPick || false;
    newProduct.isFlashSale = newProduct.isFlashSale || false;
    newProduct.tags = newProduct.tags || [];
    newProduct.images = newProduct.images || [];
    newProduct.brand = newProduct.brand || 'Kairo';

    data.products.push(newProduct);
    await writeProductsData(data);

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readProductsData();
    
    const productIndex = data.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = {
      ...data.products[productIndex],
      ...req.body,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    data.products[productIndex] = updatedProduct;
    await writeProductsData(data);

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readProductsData();
    
    const productIndex = data.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    data.products.splice(productIndex, 1);
    await writeProductsData(data);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  const startTime = Date.now();
  try {
    const { id } = req.params;
    console.log('Backend: getProductById called with ID:', id, 'at:', new Date().toISOString());
    
    const data = await readProductsData();
    console.log('Backend: Total products in database:', data.products.length);
    
    const product = data.products.find(p => p.id === id);
    console.log('Backend: Product found:', product ? 'Yes' : 'No');
    
    if (!product) {
      console.log('Backend: Product not found for ID:', id);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('Backend: Returning product:', product.name, 'at:', new Date().toISOString());
    console.log('Backend: Response time:', Date.now() - startTime, 'ms');
    res.json(product);
  } catch (error) {
    console.error('Backend: Error in getProductById:', error);
    console.log('Backend: Error response time:', Date.now() - startTime, 'ms');
    res.status(500).json({ error: error.message });
  }
};

// Search products by query
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query; // query parameter
    console.log('Backend: Search request received with query:', q);
    
    if (!q || !q.trim()) {
      console.log('Backend: Empty query, returning empty results');
      return res.json({ products: [] });
    }

    const data = await readProductsData();
    const query = q.toLowerCase().trim();
    console.log('Backend: Searching for query:', query);
    console.log('Backend: Total products in database:', data.products.length);
    
    const filteredProducts = data.products.filter(product => {
      // Search in name
      if (product.name && product.name.toLowerCase().includes(query)) {
        console.log('Backend: Found match in name:', product.name);
        return true;
      }
      
      // Search in description
      if (product.description && product.description.toLowerCase().includes(query)) {
        console.log('Backend: Found match in description:', product.name);
        return true;
      }
      
      // Search in tags
      if (product.tags && Array.isArray(product.tags)) {
        if (product.tags.some(tag => tag.toLowerCase().includes(query))) {
          console.log('Backend: Found match in tags:', product.name);
          return true;
        }
      }
      
      // Search in brand
      if (product.brand && product.brand.toLowerCase().includes(query)) {
        console.log('Backend: Found match in brand:', product.name);
        return true;
      }
      
      // Search in category
      if (product.category && product.category.toLowerCase().includes(query)) {
        console.log('Backend: Found match in category:', product.name);
        return true;
      }
      
      return false;
    });

    console.log('Backend: Search completed, found', filteredProducts.length, 'products');
    res.json({ products: filteredProducts });
  } catch (error) {
    console.error('Backend: Error in searchProducts:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  searchProducts
}; 