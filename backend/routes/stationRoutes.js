// =============================================================================
// stationRoutes.js - Health Stations Routes
// =============================================================================
// Purpose: Maps barangay health centers directory endpoints.
// =============================================================================

const express = require('express');
const router = express.Router();
const { getHealthStations } = require('../controllers/stationController');

// GET /api/health-stations -> List all health stations
router.get('/api/health-stations', getHealthStations);

module.exports = router;
