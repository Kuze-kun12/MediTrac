// =============================================================================
// stationModel.js - Barangay Health Stations Database Queries
// =============================================================================
// Purpose: Handles database queries for Barangay Health Centers / Stations.
// =============================================================================

// Grab our database connection pool
const db = require('../config/db');

/**
 * Get all barangay health stations sorted alphabetically.
 */
async function getAllHealthStations() {
  // SQL Query:
  // 1. SELECT: Grab station_id (rename as 'id' for frontend), station_name (rename as 'name'), and address
  // 2. FROM health_stations: Look in the health_stations table
  // 3. ORDER BY station_name ASC: Sort alphabetically from A to Z
  const sql = `
    SELECT 
      station_id AS id,
      station_name AS name,
      address
    FROM health_stations
    ORDER BY station_name ASC
  `;

  // Send the query to MySQL and unpack the matching rows
  const [rows] = await db.query(sql);

  // Return the station rows
  return rows;
}

// Export the query function
module.exports = {
  getAllHealthStations,
};

