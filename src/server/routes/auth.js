
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { google } = require('googleapis');

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your_jwt_secret_key';

// Google OAuth credentials (in production, use environment variables)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'AIzaSyDqCAOs2d6HL5-C7Y7tE8Pf2hMn-RijNfo';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

// Setup Google OAuth client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'vendor' } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }
    
    // Create new user (password hashing handled by pre-save hook)
    const user = new User({
      name,
      email,
      password,
      role
    });
    
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Return proper JSON response
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error registering user',
      details: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Return proper JSON response
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error logging in',
      details: error.message
    });
  }
});

// Google OAuth login URL
router.get('/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });
  
  res.redirect(authUrl);
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    // Get tokens from code
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    
    const { email, name } = data;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user with a random password (since login will be via Google)
      const randomPassword = Math.random().toString(36).slice(-10);
      
      user = new User({
        name,
        email,
        password: randomPassword,
        role: 'vendor'
      });
      
      await user.save();
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Send success message to opener window and close
    const responseHTML = `
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'google-auth-success',
              user: {
                id: "${user._id}",
                name: "${user.name}",
                email: "${user.email}",
                role: "${user.role}"
              },
              token: "${token}"
            }, "*");
            window.close();
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `;
    
    res.send(responseHTML);
  } catch (error) {
    console.error('Error with Google auth:', error);
    
    // Send error message to opener window and close
    const responseHTML = `
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'google-auth-error',
              error: "${error.message || 'Google authentication failed'}"
            }, "*");
            window.close();
          </script>
          <p>Authentication failed. You can close this window.</p>
        </body>
      </html>
    `;
    
    res.send(responseHTML);
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting user profile',
      details: error.message
    });
  }
});

module.exports = router;
