// =============================================================================
// authRoutes.js - Authentication Routes
// =============================================================================
// Purpose: Maps login endpoints.
// =============================================================================

const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// POST /login -> Authenticates user and returns redirect URL
router.post('/login', loginUser);

module.exports = router;
