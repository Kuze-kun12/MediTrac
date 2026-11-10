// =============================================================================
// medicineController.js - Medicine Inventory & Reports Controller
// =============================================================================
// Controller Logic:
// 1. Receives HTTP request from the frontend (req)
// 2. Calls the model to fetch or save database data
// 3. Sends back a clean JSON response (res)
// =============================================================================

const model = require('../models/medicineModel');
const { ok, bad } = require('../utils/response');

// 1. GET /api/data - Get all medicines for the table
async function getMedicines(req, res) {
  try {
    const items = await model.getAllMedicines();
    return ok(res, { items });
  } catch (err) {
    return bad(res, 'Could not load medicines.', 500);
  }
}

// 1b. GET /api/data/:id - Get single medicine by ID
async function getMedicineById(req, res) {
  try {
    const item = await model.getMedicineById(req.params.id);
    if (!item) {
      return bad(res, 'Medicine not found.', 404);
    }
    return ok(res, { item });
  } catch (err) {
    return bad(res, 'Could not load medicine details.', 500);
  }
}

// 2. POST /api/data - Add new medicine and initial batch
async function createMedicine(req, res) {
  const { medName, generic_name, batchNo, batch_no, expiry, expiry_date } = req.body;
  const name = medName || generic_name;
  const batch = batchNo || batch_no;
  const exp = expiry || expiry_date;

  if (!name || !batch || !exp) {
    return bad(res, 'Medicine name, batch number, and expiry date are required.', 400);
  }

  try {
    const result = await model.addMedicine(req.body);
    return ok(res, { message: 'Medicine added successfully.', id: result.id }, 201);
  } catch (err) {
    return bad(res, err.message || 'Could not add medicine.', 500);
  }
}

// 3. PUT /api/data/:id - Update existing medicine
async function updateMedicineRecord(req, res) {
  try {
    const result = await model.updateMedicine(req.params.id, req.body);
    if (result.notFound) {
      return bad(res, 'Medicine not found.', 404);
    }
    return ok(res, { message: 'Medicine updated successfully.' });
  } catch (err) {
    return bad(res, err.message || 'Could not update medicine.', 500);
  }
}

// 4. DELETE /api/data/:id - Delete medicine and its batches
async function deleteMedicineRecord(req, res) {
  try {
    const result = await model.deleteMedicine(req.params.id);
    if (result.notFound) {
      return bad(res, 'Medicine not found.', 404);
    }
    return ok(res, { message: 'Medicine deleted successfully.' });
  } catch (err) {
    return bad(res, err.message || 'Could not delete medicine.', 500);
  }
}

// 5. GET /api/alerts - Expiry & Low Stock Alerts
async function getMedicineAlerts(req, res) {
  try {
    const alerts = await model.getAlerts();
    return ok(res, { alerts });
  } catch (err) {
    return bad(res, 'Could not load alerts.', 500);
  }
}

// 5b. POST /api/alerts - Create custom/manual alert
async function createAlertRecord(req, res) {
  try {
    const result = await model.createAlert(req.body);
    return ok(res, { message: 'Alert created successfully.', id: result.id }, 201);
  } catch (err) {
    return bad(res, err.message || 'Could not create alert.', 500);
  }
}

// 5c. PUT /api/alerts/:id/resolve - Mark alert as resolved
async function resolveAlertRecord(req, res) {
  try {
    const result = await model.resolveAlert(req.params.id);
    if (result.notFound) {
      return bad(res, 'Alert not found.', 404);
    }
    return ok(res, { message: 'Alert marked as resolved.' });
  } catch (err) {
    return bad(res, err.message || 'Could not resolve alert.', 500);
  }
}

// 5d. DELETE /api/alerts/:id - Dismiss alert
async function deleteAlertRecord(req, res) {
  try {
    const result = await model.deleteAlert(req.params.id);
    if (result.notFound) {
      return bad(res, 'Alert not found.', 404);
    }
    return ok(res, { message: 'Alert dismissed successfully.' });
  } catch (err) {
    return bad(res, err.message || 'Could not dismiss alert.', 500);
  }
}

// 6. GET /api/fefo - Batches sorted by earliest expiry (FEFO)
async function getFefo(req, res) {
  try {
    const fefo = await model.getFefoOrder();
    return ok(res, { fefo });
  } catch (err) {
    return bad(res, 'Could not load FEFO.', 500);
  }
}

// =============================================================================
// SQL JOIN REPORTS (For Defense)
// =============================================================================

// GET /api/joined-medicines - INNER JOIN (Medicines with Categories)
async function getJoinedMedicines(req, res) {
  try {
    const items = await model.getMedicinesWithCategory();
    return ok(res, { items });
  } catch (err) {
    return bad(res, 'Could not load INNER JOIN report.', 500);
  }
}

// GET /api/reports/missing-batches - LEFT JOIN (Medicines with no batch)
async function getMissingBatchReport(req, res) {
  try {
    const items = await model.getMedicinesWithMissingBatch();
    return ok(res, { items });
  } catch (err) {
    return bad(res, 'Could not load LEFT JOIN report.', 500);
  }
}

// GET /api/reports/right-join - RIGHT JOIN (All health stations & stock)
async function getRightJoinReport(req, res) {
  try {
    const items = await model.getStationsWithBatchesRightJoin();
    return ok(res, { items });
  } catch (err) {
    return bad(res, 'Could not load RIGHT JOIN report.', 500);
  }
}

// GET /api/reports/full-outer-medicines - FULL OUTER JOIN (Simulated via UNION)
async function getFullOuterReport(req, res) {
  try {
    const items = await model.getMedicineFullOuterJoinSimulated();
    return ok(res, { items });
  } catch (err) {
    return bad(res, 'Could not load FULL OUTER JOIN report.', 500);
  }
}

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicineRecord,
  deleteMedicineRecord,
  getMedicineAlerts,
  createAlertRecord,
  resolveAlertRecord,
  deleteAlertRecord,
  getFefo,
  getJoinedMedicines,
  getMissingBatchReport,
  getRightJoinReport,
  getFullOuterReport,
};
