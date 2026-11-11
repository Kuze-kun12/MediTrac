// =============================================================================
// dispensingController.js - Dispensing Management Controller
// =============================================================================
// Handles patient dispensing and barangay distribution requests.
// =============================================================================

const model = require('../models/dispensingModel');
const { getAllHealthStations } = require('../models/stationModel');
const { getAllPatients } = require('../models/patientModel');
const { ok, bad } = require('../utils/response');

// 1. GET /api/dispensing-options - Dropdowns data (stations, batches, patients)
async function getDispensingOptions(req, res) {
  try {
    const [stations, batches, patients] = await Promise.all([
      getAllHealthStations(),
      model.getAvailableMedicineBatches(),
      getAllPatients(),
    ]);
    return ok(res, { stations, batches, patients });
  } catch (err) {
    return bad(res, 'Could not load dispensing options.', 500);
  }
}

// 2. GET /api/dispensing-records - Dispensing transaction log
async function getDispensingRecords(req, res) {
  try {
    const items = await model.getDispensingLog();
    return ok(res, { items });
  } catch (err) {
    return bad(res, 'Could not load dispensing log.', 500);
  }
}

// 3. GET /api/barangay-summary - Distributions per barangay station
async function getBarangaySummary(req, res) {
  try {
    const items = await model.getBarangayDistributionSummary();
    return ok(res, { items });
  } catch (err) {
    return bad(res, 'Could not load barangay summary.', 500);
  }
}

// 4. POST /api/dispensing-records - Save dispensing & deduct inventory
async function createDispensingRecord(req, res) {
  const { station_id, batch_id, qty, patient_id, patient_name, user_id } = req.body;
  const quantity = Number(qty || 1);

  if (!station_id || !batch_id || quantity <= 0) {
    return bad(res, 'Station, medicine batch, and quantity are required.', 400);
  }

  try {
    const result = await model.addDispensingRecord({
      station_id: Number(station_id),
      batch_id: Number(batch_id),
      qty: quantity,
      patient_id: patient_id ? Number(patient_id) : null,
      patient_name: patient_name || '',
      user_id: user_id ? Number(user_id) : 1,
    });
    return ok(res, { message: 'Dispensed successfully.', item: result }, 201);
  } catch (err) {
    return bad(res, err.message || 'Could not save dispensing record.', 400);
  }
}

module.exports = {
  getDispensingOptions,
  getDispensingRecords,
  getBarangaySummary,
  createDispensingRecord,
};
