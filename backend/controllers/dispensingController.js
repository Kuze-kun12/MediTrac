// =============================================================================
// dispensingController.js - Dispensing & Inventory Brain / Controller
// =============================================================================
// Purpose: Controls giving out medicines to patients and deducting inventory atomically.
// =============================================================================

// Grab our dispensing database model
const model = require('../models/dispensingModel');

// Grab helper from stationModel to fetch the list of barangay stations
const { getAllHealthStations } = require('../models/stationModel');

// Grab helper from patientModel to fetch registered patients
const { getAllPatients } = require('../models/patientModel');

// Grab our standard response helpers (ok = 200/201, bad = 400/500)
const { ok, bad } = require('../utils/response');

// 1. GET /api/dispensing-options - Provides all data needed to fill out dropdowns on the screen
async function getDispensingOptions(req, res) {
  try {
    // Run 3 database queries simultaneously in parallel to be super fast!
    // 1: All health stations, 2: Available medicine batches with stock, 3: All patients
    const [stations, batches, patients] = await Promise.all([
      getAllHealthStations(),
      model.getAvailableMedicineBatches(),
      getAllPatients(),
    ]);

    // Send back 200 OK with all three dropdown lists packaged together
    return ok(res, { stations, batches, patients });
  } catch (err) {
    // 500 Server Error if loading failed
    return bad(res, 'Could not load dispensing options.', 500);
  }
}

// 2. GET /api/dispensing-records - History log of past medicine distributions
async function getDispensingRecords(req, res) {
  try {
    // Step 1: Ask the model for the most recent 30 dispensing transactions
    const items = await model.getDispensingLog();

    // Step 2: Return 200 OK with the log items
    return ok(res, { items });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, 'Could not load dispensing log.', 500);
  }
}

// 3. GET /api/barangay-summary - Total medicines sent to each barangay station
async function getBarangaySummary(req, res) {
  try {
    // Step 1: Ask the model to calculate sum of medicines given to each health station
    const items = await model.getBarangayDistributionSummary();

    // Step 2: Return 200 OK with the summary report
    return ok(res, { items });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, 'Could not load barangay summary.', 500);
  }
}

// 4. POST /api/dispensing-records - Give medicine & subtract from inventory stock
async function createDispensingRecord(req, res) {
  // Step 1: Unpack what was selected in the form
  const { station_id, batch_id, qty, patient_id, patient_name, user_id } = req.body;
  const quantity = Number(qty || 1);

  // Step 2: Validation! Must have a station, a batch, and a quantity greater than zero
  if (!station_id || !batch_id || quantity <= 0) {
    // 400 Bad Request
    return bad(res, 'Station, medicine batch, and quantity are required.', 400);
  }

  try {
    // Step 3: Tell model to run a MySQL TRANSACTION (atomic stock deduction!)
    const result = await model.addDispensingRecord({
      station_id: Number(station_id),
      batch_id: Number(batch_id),
      qty: quantity,
      patient_id: patient_id ? Number(patient_id) : null,
      patient_name: patient_name || '',
      user_id: user_id ? Number(user_id) : 1,
    });

    // Step 4: Return 201 Created with the receipt/details of what was dispensed!
    return ok(res, { message: 'Dispensed successfully.', item: result }, 201);
  } catch (err) {
    // If not enough stock or anything failed, return 400 Bad Request with the reason
    return bad(res, err.message || 'Could not save dispensing record.', 400);
  }
}

// Export all 4 functions for dispensingRoutes.js
module.exports = {
  getDispensingOptions,
  getDispensingRecords,
  getBarangaySummary,
  createDispensingRecord,
};

