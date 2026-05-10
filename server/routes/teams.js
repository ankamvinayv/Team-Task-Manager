// FILE: server/routes/teams.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const User = require('../models/User');

// GET /api/teams — list all users (for admin member management)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error fetching team members' });
  }
});

// GET /api/teams/:id — get single user
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({ message: 'Server error fetching team member' });
  }
});

module.exports = router;
