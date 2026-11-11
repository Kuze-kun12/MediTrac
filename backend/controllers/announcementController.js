// =============================================================================
// announcementController.js - Announcements Controller
// =============================================================================
// GET  /api/announcements → everyone can read announcements
// POST /api/announcements → admin posts a new announcement
// =============================================================================

const model = require('../models/announcementModel');
const { ok, bad } = require('../utils/response');

// GET /api/announcements - Return all announcements
async function getAnnouncements(req, res) {
  try {
    const items = await model.getAllAnnouncements();
    return ok(res, { items });
  } catch (err) {
    return bad(res, 'Could not load announcements.', 500);
  }
}

// POST /api/announcements - Admin posts a new announcement
async function createAnnouncement(req, res) {
  const { title, body, posted_by } = req.body;

  if (!title || !body) {
    return bad(res, 'Title and message body are required.', 400);
  }

  try {
    const result = await model.addAnnouncement({ title, body, posted_by });
    return ok(res, { message: 'Announcement posted successfully.', id: result.id }, 201);
  } catch (err) {
    return bad(res, err.message || 'Could not post announcement.', 500);
  }
}

// DELETE /api/announcements/:id - Delete an announcement
async function deleteAnnouncement(req, res) {
  const { id } = req.params;

  try {
    const result = await model.deleteAnnouncement(id);
    if (!result.success) {
      return bad(res, 'Announcement not found.', 404);
    }
    return ok(res, { message: 'Announcement deleted successfully.' });
  } catch (err) {
    return bad(res, err.message || 'Could not delete announcement.', 500);
  }
}

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
