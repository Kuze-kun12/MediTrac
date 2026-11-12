
// =============================================================================
// stationController.js - Barangay Health Stations Brain / Controller
// =============================================================================
// Purpose: Handles requests for showing all barangay health centers.
// =============================================================================

// Grab the database model function that reads health stations
const { getAllHealthStations } = require('../models/stationModel');

// Grab our helper response tools (ok = happy 200, bad = sad error)
const { ok, bad } = require('../utils/response');

/**
 * GET /api/health-stations
 * Sends back the list of all barangay health stations to the frontend.
 */
async function getHealthStations(req, res) {
  try {
    // Step 1: Call the model to query the database for all stations
    const rows = await getAllHealthStations();

    // Step 2: Send back a 200 OK JSON response with the stations inside "items"
    return ok(res, { items: rows });
  } catch (error) {
    // If the database fails, log the error message to the terminal
    console.error('Get health stations error:', error);
    // Send back a 500 Server Error to let the frontend know it failed
    return bad(res, 'Could not load health stations.', 500);
  }
}

// Export this controller so stationRoutes.js can use it
module.exports = {
  getHealthStations,
};

