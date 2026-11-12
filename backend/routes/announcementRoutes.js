// =============================================================================
// announcementRoutes.js - Announcement Routes
// =============================================================================

const express = require('express');
const router  = express.Router();
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');

// GET  /api/announcements → everyone reads announcements
router.get('/api/announcements', getAnnouncements);

// POST /api/announcements → admin posts announcement
router.post('/api/announcements', createAnnouncement);

// DELETE /api/announcements/:id → admin deletes an announcement
router.delete('/api/announcements/:id', deleteAnnouncement);

module.exports = router;
