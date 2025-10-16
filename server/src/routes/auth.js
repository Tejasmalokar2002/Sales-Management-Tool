const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Register (for initial seeding or admin-only usage; in prod restrict)
router.post('/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['admin','supervisor'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already used' });

      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = new User({ name, email, passwordHash, role: role || 'supervisor' });
      await user.save();

      res.status(201).json({ message: 'User created' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);


// Get user statistics (invoices created, customers added, products managed)
router.get('/user-stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Count invoices created by this user
    const invoicesCreated = await Invoice.countDocuments({ createdBy: userId });
    
    // Count customers created by this user
    const customersAdded = await Customer.countDocuments({ createdBy: userId });
    
    // Count products created by this user
    const productsManaged = await Product.countDocuments({ createdBy: userId });
    
    res.json({
      invoicesCreated,
      customersAdded,
      productsManaged
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        lastLogin: user.lastLogin 
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active users count (users who logged in today)
router.get('/active-users', authenticate, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    // Count users who logged in today OR created today (for new users)
    const activeUsers = await User.countDocuments({
      $or: [
        { lastLogin: { $gte: startOfDay } },
        { createdAt: { $gte: startOfDay } }
      ]
    });
    
    res.json({ activeUsers });
  } catch (err) {
    console.error('Error fetching active users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile endpoint
router.put('/profile', authenticate, 
  [
    body('email').optional().isEmail(),
    body('name').optional().notEmpty(),
    body('newPassword').optional().isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { name, email, currentPassword, newPassword } = req.body;
    
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Update basic info
      if (name) user.name = name;
      if (email) {
        const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
        if (emailExists) return res.status(400).json({ message: 'Email already in use' });
        user.email = email;
      }

      // Update password if provided
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required' });
        }
        
        const match = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
        user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
      }

      await user.save();

      // Return updated user info (excluding password)
      const updatedUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      };

      res.json({ 
        message: 'Profile updated successfully',
        user: updatedUser 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;