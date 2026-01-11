import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

// =====================
// CONFIG
// =====================
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  '340273851214-te11ivt82uuosp8eg4pghchhg8sua45d.apps.googleusercontent.com';

// ✅ IMPORTANT: ONLY Client ID (NO secret here)
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// =====================
// REGISTER
// =====================
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// =====================
// LOGIN
// =====================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =====================
// VERIFY JWT
// =====================
router.post('/verify', async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// =====================
// GOOGLE OAUTH
// =====================
router.post('/google', async (req, res) => {
  console.log('🔵 Google OAuth route called');
  console.log('Request body:', req.body);

  const { token } = req.body;

  try {
    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    console.log('🔍 Verifying Google token...');
    console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);

    // ✅ Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('✅ Token verified! Payload:', payload);
    
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      console.log('👤 Creating new user:', email);
      try {
        user = new User({
          name: name || email.split('@')[0],
          email,
          picture,
          googleId,
          password: Math.random().toString(36).slice(-8), // dummy password
        });
        await user.save();
        console.log('✅ New user created:', email);
      } catch (saveErr) {
        if (saveErr.code === 11000) {
          console.log('⚠️ User already exists (duplicate), fetching existing user...');
          user = await User.findOne({ email });
        } else {
          throw saveErr;
        }
      }
    } else {
      console.log('👤 User already exists:', email);
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User authenticated:', email);
    res.json({
      success: true,
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error('❌ Google OAuth error:', err.message);
    console.error('Full error:', err);
    res
      .status(401)
      .json({ success: false, error: 'Google authentication failed: ' + err.message });
  }
});

export default router;
