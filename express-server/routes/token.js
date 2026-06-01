const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../config/jwt');

// POST /api/token/refresh
// Silent token refresh - called automatically once per day by the client
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    // Update last token refresh timestamp
    user.lastTokenRefresh = new Date();
    await user.save();

    // Issue new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/token/verify
// Used by Next.js middleware to validate access tokens
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ valid: false });

    const { verifyAccessToken } = require('../config/jwt');
    const decoded = verifyAccessToken(token);

    res.json({ valid: true, payload: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, message: err.message });
  }
});

module.exports = router;
