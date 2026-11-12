// =============================================================================
// announcementController.js - Announcements Brain / Controller
// =============================================================================
// Purpose: Controls reading, posting, and deleting notices on the notice board.
// =============================================================================

// Grab our database model that talks to the announcements table
const model = require('../models/announcementModel');

// Grab our response helpers (ok = 200/201 success, bad = 400/404/500 failure)
const { ok, bad } = require('../utils/response');

// 1. GET /api/announcements - Fetch and show all announcements
async function getAnnouncements(req, res) {
  try {
    // Step 1: Ask the database model to get all announcements from newest to oldest
    const items = await model.getAllAnnouncements();

    // Step 2: Return 200 OK with the announcements inside { items: [...] }
    return ok(res, { items });
  } catch (err) {
    // If database query failed, send 500 Server Error
    return bad(res, 'Could not load announcements.', 500);
  }
}

// 2. POST /api/announcements - Save a new announcement
async function createAnnouncement(req, res) {
  // Step 1: Unpack what the user typed: title, body message, and who posted it
  const { title, body, posted_by } = req.body;

  // Step 2: Validation check! Did they leave the title or message empty?
  if (!title || !body) {
    // 400 Bad Request: Tell user they must provide both title and body
    return bad(res, 'Title and message body are required.', 400);
  }

  try {
    // Step 3: Tell the model to insert the new announcement into MySQL
    const result = await model.addAnnouncement({ title, body, posted_by });

    // Step 4: Return 201 Created status code with the newly created ID!
    return ok(res, { message: 'Announcement posted successfully.', id: result.id }, 201);
  } catch (err) {
    // If saving failed, send 500 Server Error
    return bad(res, err.message || 'Could not post announcement.', 500);
  }
}

// 3. DELETE /api/announcements/:id - Delete an announcement by ID
async function deleteAnnouncement(req, res) {
  // Step 1: Grab the ID number from the URL parameter (e.g. /api/announcements/5 -> id is 5)
  const { id } = req.params;

  try {
    // Step 2: Tell the model to delete that announcement from MySQL
    const result = await model.deleteAnnouncement(id);

    // Step 3: If no row was deleted, it means that ID did not exist!
    if (!result.success) {
      // 404 Not Found: "Hey, that announcement doesn't exist!"
      return bad(res, 'Announcement not found.', 404);
    }

    // Step 4: Return 200 OK: Successfully deleted!
    return ok(res, { message: 'Announcement deleted successfully.' });
  } catch (err) {
    // If deletion had an error, return 500 Server Error
    return bad(res, err.message || 'Could not delete announcement.', 500);
  }
}

// Export all 3 controller functions for announcementRoutes.js
module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};

