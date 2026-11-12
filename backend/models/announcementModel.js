// =============================================================================
// announcementModel.js - Announcements Model
// =============================================================================
// What this does (simple version):
//   READ  → Get all announcements (newest first)
//   CREATE → Admin posts a new announcement
// =============================================================================

const db = require('../config/db');

// READ: Get all announcements, newest first
async function getAllAnnouncements() {
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

// CREATE: Save a new announcement
async function addAnnouncement({ title, body, posted_by }) {
  const [result] = await db.query(
    'INSERT INTO announcements (title, body, posted_by) VALUES (?, ?, ?)',
    [title, body, Number(posted_by) || 1]
  );
  return { id: result.insertId };
}

// DELETE: Remove an announcement by ID
async function deleteAnnouncement(id) {
  const [result] = await db.query('DELETE FROM announcements WHERE announcement_id = ?', [Number(id)]);
  return { success: result.affectedRows > 0 };
}

module.exports = {
  getAllAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
};
