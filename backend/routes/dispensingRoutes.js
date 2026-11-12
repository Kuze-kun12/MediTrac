// =============================================================================
// dispensingRoutes.js - Dispensing & Distribution Doorway
// =============================================================================
// Purpose: Handles giving out medicines to patients and distributing to barangays.
// =============================================================================

// Bring in Express for building routes
const express = require('express');

// Create our router map for dispensing URLs
const router = express.Router();

// Grab our 4 dispensing controller handlers
const {
  getDispensingOptions,
  getDispensingRecords,
  getBarangaySummary,
  createDispensingRecord,
} = require('../controllers/dispensingController');

// 1. GET /api/dispensing-options -> Gives the frontend the dropdown menus (stations, batches, patients)
router.get('/api/dispensing-options', getDispensingOptions);

// 2. GET /api/dispensing-records -> Gives the history log of past medicine dispensings
router.get('/api/dispensing-records', getDispensingRecords);

// 3. GET /api/barangay-summary -> Shows total medicines distributed to each barangay health station
router.get('/api/barangay-summary', getBarangaySummary);

// 4. POST /api/dispensing-records -> Dispenses medicine to a patient and subtracts stock atomically!
router.post('/api/dispensing-records', createDispensingRecord);

// Export this router so server.js can load it
module.exports = router;

