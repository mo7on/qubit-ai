const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { loginSchema, registerSchema, changePasswordSchema } = require('../schemas/auth.schema');

// Public routes with validation
router.post('/register', validate(registerSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/change-password', verifyToken, validate(changePasswordSchema), authController.changePassword);
router.post('/deactivate', verifyToken, authController.deactivateAccount);

// Admin routes
router.post('/reactivate/:userId', verifyToken, authController.reactivateAccount);
router.get('/history', verifyToken, authController.getUserHistory);

module.exports = router;