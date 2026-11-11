// =============================================================================
// stationModel.js - Barangay Health Stations Model
// =============================================================================
// Purpose: Handles database queries for Barangay Health Centers / Stations.
// =============================================================================

const db = require('../config/db');

/**
 * Get all barangay health stations sorted alphabetically.
 */
async function getAllHealthStations() {
  const sql = `
    SELECT 
      station_id AS id,
      station_name AS name,
      address
    FROM health_stations
    ORDER BY station_name ASC
  `;

  const [rows] = await db.query(sql);
  return rows;
}

module.exports = {
  getAllHealthStations,
};
