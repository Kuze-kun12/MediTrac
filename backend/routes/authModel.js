// =============================================================================
// authModel.js - User Authentication Model
// =============================================================================
// Purpose: Handles database queries for logging in users and finding their roles.
// =============================================================================

const db = require('../config/db');

/**
 * Find user by username and password.
 * Uses LEFT JOIN with roles table to fetch role_name (admin, pharmacist, health worker).
 */
async function getUserByLogin(username, password) {
  const sql = `
    SELECT 
      u.user_id,
      u.username,
      u.full_name,
      r.role_name
    FROM users u
    LEFT JOIN roles r ON r.role_id = u.role_id
    WHERE u.username = ? AND u.password_hash = ?
  `;

  const [rows] = await db.query(sql, [username, password]);
  return rows;
}

module.exports = {
  getUserByLogin,
};
