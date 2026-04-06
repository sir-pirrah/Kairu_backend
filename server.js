const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const authenticateToken = require('./middleware/auth');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Load environment variables
require('dotenv').config();

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:4200', 
    'http://localhost:35935', 
    'http://127.0.0.1:4200', 
    'http://127.0.0.1:35935',
    'https://kairu-agric.vercel.app',    
    'https://kk20k.vercel.app', 
    'https://*.vercel.app' // Allow all Vercel subdomains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Public routes
app.use('/api/auth', authRoutes);
// Public upload route (must be before authenticateToken)
app.use('/api/products', require('./routes/productRoutes'));

// Protected routes - require authentication
// app.use('/api/products', authenticateToken, productRoutes);

// Serve static files from public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Kairo E-commerce API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kairo E-commerce API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      auth: '/api/auth'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Kairo E-commerce API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Admin credentials: ${process.env.ADMIN_USERNAME} / ${process.env.ADMIN_PASSWORD}`);
}); 
