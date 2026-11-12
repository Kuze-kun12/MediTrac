// =============================================================================
// authModel.js - User Authentication Database Queries
// =============================================================================
// Purpose: Talks directly to MySQL to check usernames, passwords, and user roles.
// =============================================================================

// Grab our database connection pool from backend/config/db.js
const db = require('../config/db');

/**
 * Find user by username and password.
 * Uses a LEFT JOIN with the roles table to find out what role the person has
 * (e.g., 'admin', 'pharmacist', or 'health worker').
 */
async function getUserByLogin(username, password) {
  // SQL Query:
  // 1. SELECT: We want their ID, username, full real name, and their official role name
  // 2. FROM users u: Look inside the users table (call it 'u' for short)
  // 3. LEFT JOIN roles r: Connect each user to their role in the roles table ('r')
  // 4. WHERE: Only pick the row where username and password match!
  //    (We use '?' placeholders to completely prevent SQL Injection hackers!)
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

  // Send the SQL query to MySQL, safely inserting the username and password in place of the '?'
  const [rows] = await db.query(sql, [username, password]);

  // Return the matching user rows back to authController
  return rows;
}

// Export this query function
module.exports = {
  getUserByLogin,
};

