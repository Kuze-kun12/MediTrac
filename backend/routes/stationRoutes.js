// =============================================================================
// stationRoutes.js - Barangay Health Stations Doorway
// =============================================================================
// Purpose: Lets the front-end ask for the list of Barangay Health Centers.
// =============================================================================

// Bring in Express to help us route network traffic
const express = require('express');

// Create our router mini-map for health station URLs
const router = express.Router();

// Grab the controller function that knows how to fetch stations
const { getHealthStations } = require('../controllers/stationController');

// When the frontend asks "GET /api/health-stations", give them the list of all stations!
router.get('/api/health-stations', getHealthStations);

// Export this router so server.js can use it
module.exports = router;

