const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }

    // Check credentials against environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (username !== adminUsername) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    
   
    if (password !== adminPassword) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: username,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1hr' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        username: username,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
});

// Verify token route (optional - for frontend to check if token is still valid)
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'No token provided' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        message: 'Invalid or expired token' 
      });
    }
    res.json({ 
      message: 'Token is valid',
      user: user 
    });
  });
});

module.exports = router; 