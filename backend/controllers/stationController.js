
const { getAllHealthStations } = require('../models/stationModel');
const { ok, bad } = require('../utils/response');

/**
 * GET /api/health-stations
 * Returns the list of barangay health stations.
 */
async function getHealthStations(req, res) {
  try {
    const rows = await getAllHealthStations();
    return ok(res, { items: rows });
  } catch (error) {
    console.error('Get health stations error:', error);
    return bad(res, 'Could not load health stations.', 500);
  }
}

module.exports = {
  getHealthStations,
};
