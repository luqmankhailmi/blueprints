const express = require('express');
const { body } = require('express-validator');
const { register, login, googleAuth, getMe } = require('../controllers/authController');
const { verifyToken, generateToken } = require('../middleware/auth');
const passport = require('../config/passport');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/google', googleAuth); // For frontend-initiated OAuth
router.get('/me', verifyToken, getMe);

// Google OAuth routes (backend-initiated flow)
router.get(
  '/google/redirect',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user.id);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

module.exports = router;
