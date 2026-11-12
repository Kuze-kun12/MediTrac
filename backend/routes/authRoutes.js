// =============================================================================
// authRoutes.js - Sign In / Login Doorway
// =============================================================================
// Purpose: Listens for when someone tries to log in.
// =============================================================================

// Bring in Express so we can build web routes
const express = require('express');

// Create a new router box (a mini map of URLs for logging in)
const router = express.Router();

// Grab the loginUser brain function from our authController
const { loginUser } = require('../controllers/authController');

// When someone sends a POST request to '/login' (submits the login form),
// run the loginUser function to check their username and password
router.post('/login', loginUser);

// Export this router so server.js can plug it into our website
module.exports = router;

