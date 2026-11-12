// =============================================================================
// announcementRoutes.js - Notice Board / Announcements Doorway
// =============================================================================
// Purpose: Lets users read notices and allows admins to post or delete notices.
// =============================================================================

// Bring in Express for routing
const express = require('express');

// Create the router map for announcements
const router  = express.Router();

// Grab our 3 announcement brain functions (read, make new, delete)
const { 
  getAnnouncements, 
  createAnnouncement, 
  deleteAnnouncement 
} = require('../controllers/announcementController');

// 1. GET /api/announcements -> Anyone can read the list of announcements
router.get('/api/announcements', getAnnouncements);

// 2. POST /api/announcements -> Saves a brand new announcement to the board
router.post('/api/announcements', createAnnouncement);

// 3. DELETE /api/announcements/:id -> Removes an announcement by its ID number
router.delete('/api/announcements/:id', deleteAnnouncement);

// Export this router so server.js can mount it
module.exports = router;

