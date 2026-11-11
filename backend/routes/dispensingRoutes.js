// =============================================================================
// dispensingRoutes.js - Dispensing Routes
// =============================================================================
// Purpose: Maps medicine dispensing endpoints.
// =============================================================================

const express = require('express');
const router = express.Router();
const {
  getDispensingOptions,
  getDispensingRecords,
  getBarangaySummary,
  createDispensingRecord,
} = require('../controllers/dispensingController');

// GET /api/dispensing-options -> Batches with stock, health centers, and patients
router.get('/api/dispensing-options', getDispensingOptions);

// GET /api/dispensing-records -> Recent dispensing log entries
router.get('/api/dispensing-records', getDispensingRecords);

// GET /api/barangay-summary -> Summary of distributions per barangay station
router.get('/api/barangay-summary', getBarangaySummary);

// POST /api/dispensing-records -> Record dispensing and deduct stock
router.post('/api/dispensing-records', createDispensingRecord);

module.exports = router;
