// =============================================================================
// announcementModel.js - Announcements Database Queries
// =============================================================================
// What this does (simple version):
//   READ   → Get all announcements (newest first)
//   CREATE → Save a new announcement to MySQL
//   DELETE → Remove an announcement from MySQL by ID
// =============================================================================

// Grab our database connection pool
const db = require('../config/db');

// 1. READ: Get all announcements, newest first
async function getAllAnnouncements() {
  // SQL Query:
  // JOIN announcements table with users table so we can show the poster's real name (postedBy)
  // ORDER BY created_at DESC puts the freshest news at the very top!
  const sql = `
    SELECT
      a.announcement_id AS id,
      a.title,
      a.body,
      u.full_name  AS postedBy,
      a.created_at AS createdAt
    FROM announcements a
    JOIN users u ON u.user_id = a.posted_by
    ORDER BY a.created_at DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// 2. CREATE: Save a new announcement into MySQL
async function addAnnouncement({ title, body, posted_by }) {
  // Insert title, message body, and user ID into announcements table
  // Uses '?' parameters to stay completely safe against hackers!
  const [result] = await db.query(
    'INSERT INTO announcements (title, body, posted_by) VALUES (?, ?, ?)',
    [title, body, Number(posted_by) || 1]
  );
  // Return the newly created ID number (result.insertId)
  return { id: result.insertId };
}

// 3. DELETE: Remove an announcement from MySQL by ID
async function deleteAnnouncement(id) {
  // Run SQL DELETE query where announcement_id matches the given number
  const [result] = await db.query('DELETE FROM announcements WHERE announcement_id = ?', [Number(id)]);
  // If affectedRows is greater than 0, it means it found and deleted it!
  return { success: result.affectedRows > 0 };
}

// Export these functions
module.exports = {
  getAllAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
};

