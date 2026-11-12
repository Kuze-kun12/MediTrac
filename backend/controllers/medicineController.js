// =============================================================================
// medicineController.js - Medicine Inventory & Reports Brain / Controller
// =============================================================================
// Controller Logic (Simple Steps):
// 1. Receives HTTP request from the frontend (req.body or req.params)
// 2. Calls the model to fetch or save database data in MySQL
// 3. Sends back a clean JSON response (res) with appropriate status code!
// =============================================================================

// Grab our medicine database model
const model = require('../models/medicineModel');

// Grab our response helpers (ok = happy 200/201, bad = sad error 400/404/500)
const { ok, bad } = require('../utils/response');

// 1. GET /api/data - Get all medicines to show in the inventory table
async function getMedicines(req, res) {
  try {
    // Step 1: Ask model for all active medicines and their batch information
    const items = await model.getAllMedicines();

    // Step 2: Return 200 OK with the list of medicines
    return ok(res, { items });
  } catch (err) {
    // 500 Server Error if database query fails
    return bad(res, 'Could not load medicines.', 500);
  }
}

// 1b. GET /api/data/:id - Get just one medicine's details by its ID number
async function getMedicineById(req, res) {
  try {
    // Step 1: Ask model to find the medicine matching the ID from the URL
    const item = await model.getMedicineById(req.params.id);

    // Step 2: If no medicine has that ID
    if (!item) {
      // 404 Not Found: "Medicine does not exist!"
      return bad(res, 'Medicine not found.', 404);
    }

    // Step 3: Return 200 OK with that medicine's data
    return ok(res, { item });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, 'Could not load medicine details.', 500);
  }
}

// 2. POST /api/data - Add a new medicine and its first stock batch
async function createMedicine(req, res) {
  // Step 1: Extract medicine details sent from the frontend form
  const { medName, generic_name, batchNo, batch_no, expiry, expiry_date } = req.body;
  const name = medName || generic_name;
  const batch = batchNo || batch_no;
  const exp = expiry || expiry_date;

  // Step 2: Validation check! Name, batch number, and expiry date are strictly required
  if (!name || !batch || !exp) {
    // 400 Bad Request: Missing required form fields
    return bad(res, 'Medicine name, batch number, and expiry date are required.', 400);
  }

  try {
    // Step 3: Tell model to save the medicine and its batch into MySQL
    const result = await model.addMedicine(req.body);

    // Step 4: Return 201 Created with the new medicine ID!
    return ok(res, { message: 'Medicine added successfully.', id: result.id }, 201);
  } catch (err) {
    // 500 Server Error if insert fails
    return bad(res, err.message || 'Could not add medicine.', 500);
  }
}

// 3. PUT /api/data/:id - Update an existing medicine and batch
async function updateMedicineRecord(req, res) {
  try {
    // Step 1: Tell model to update medicine fields and batch quantities in MySQL
    const result = await model.updateMedicine(req.params.id, req.body);

    // Step 2: If the medicine ID does not exist in the database
    if (result.notFound) {
      // 404 Not Found
      return bad(res, 'Medicine not found.', 404);
    }

    // Step 3: Return 200 OK: Medicine updated!
    return ok(res, { message: 'Medicine updated successfully.' });
  } catch (err) {
    // 500 Server Error if update fails
    return bad(res, err.message || 'Could not update medicine.', 500);
  }
}

// 4. DELETE /api/data/:id - Safely delete a medicine and its child batches
async function deleteMedicineRecord(req, res) {
  try {
    // Step 1: Tell model to delete related records first, then delete medicine
    const result = await model.deleteMedicine(req.params.id);

    // Step 2: If the medicine was not found
    if (result.notFound) {
      // 404 Not Found
      return bad(res, 'Medicine not found.', 404);
    }

    // Step 3: Return 200 OK: Deleted successfully!
    return ok(res, { message: 'Medicine deleted successfully.' });
  } catch (err) {
    // 500 Server Error if delete fails
    return bad(res, err.message || 'Could not delete medicine.', 500);
  }
}

// 5. GET /api/alerts - Expiry & Low Stock safety alerts
async function getMedicineAlerts(req, res) {
  try {
    // Step 1: Ask model for batches that are expired OR below their reorder level
    const alerts = await model.getAlerts();

    // Step 2: Return 200 OK with the alerts list
    return ok(res, { alerts });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, 'Could not load alerts.', 500);
  }
}

// 5b. POST /api/alerts - Create a manual safety warning alert
async function createAlertRecord(req, res) {
  try {
    // Step 1: Tell model to insert new alert record
    const result = await model.createAlert(req.body);

    // Step 2: Return 201 Created with the alert ID
    return ok(res, { message: 'Alert created successfully.', id: result.id }, 201);
  } catch (err) {
    // 500 Server Error if insert fails
    return bad(res, err.message || 'Could not create alert.', 500);
  }
}

// 5c. PUT /api/alerts/:id/resolve - Mark a warning alert as resolved
async function resolveAlertRecord(req, res) {
  try {
    // Step 1: Tell model to set resolved_at = NOW() for this alert ID
    const result = await model.resolveAlert(req.params.id);

    // Step 2: If alert ID was not found
    if (result.notFound) {
      // 404 Not Found
      return bad(res, 'Alert not found.', 404);
    }

    // Step 3: Return 200 OK: Alert marked as resolved!
    return ok(res, { message: 'Alert marked as resolved.' });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, err.message || 'Could not resolve alert.', 500);
  }
}

// 5d. DELETE /api/alerts/:id - Dismiss / permanently delete an alert
async function deleteAlertRecord(req, res) {
  try {
    // Step 1: Tell model to delete alert by ID
    const result = await model.deleteAlert(req.params.id);

    // Step 2: If alert ID was not found
    if (result.notFound) {
      // 404 Not Found
      return bad(res, 'Alert not found.', 404);
    }

    // Step 3: Return 200 OK: Alert dismissed!
    return ok(res, { message: 'Alert dismissed successfully.' });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, err.message || 'Could not dismiss alert.', 500);
  }
}

// 6. GET /api/fefo - Batches sorted by earliest expiration date first (FEFO)
async function getFefo(req, res) {
  try {
    // Step 1: Ask model for batches ordered by expiry_date ASC
    const fefo = await model.getFefoOrder();

    // Step 2: Return 200 OK with the FEFO priority list
    return ok(res, { fefo });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, 'Could not load FEFO.', 500);
  }
}

// =============================================================================
// REQUIRED SQL JOIN REPORTS (For DBMS 1 Defense)
// =============================================================================

// 7. GET /api/joined-medicines - INNER JOIN (Only medicines that have a category)
async function getJoinedMedicines(req, res) {
  try {
    // Step 1: Run INNER JOIN query between medicines and medicine_categories
    const items = await model.getMedicinesWithCategory();

    // Step 2: Return 200 OK with the joined items
    return ok(res, { items });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, 'Could not load INNER JOIN report.', 500);
  }
}

// 8. GET /api/reports/missing-batches - LEFT JOIN (Medicines with NO batches)
async function getMissingBatchReport(req, res) {
  try {
    // Step 1: Run LEFT JOIN query to find medicines with NULL batch
    const items = await model.getMedicinesWithMissingBatch();

    // Step 2: Return 200 OK with the missing-batch report
    return ok(res, { items });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, 'Could not load LEFT JOIN report.', 500);
  }
}

// 9. GET /api/reports/right-join - RIGHT JOIN (All health stations & stock)
async function getRightJoinReport(req, res) {
  try {
    // Step 1: Run RIGHT JOIN query to include all health stations even with no stock
    const items = await model.getStationsWithBatchesRightJoin();

    // Step 2: Return 200 OK with the right-join report
    return ok(res, { items });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, 'Could not load RIGHT JOIN report.', 500);
  }
}

// 10. GET /api/reports/full-outer-medicines - FULL OUTER JOIN (Simulated via UNION)
async function getFullOuterReport(req, res) {
  try {
    // Step 1: Run simulated FULL OUTER JOIN (LEFT JOIN + UNION + RIGHT JOIN)
    const items = await model.getMedicineFullOuterJoinSimulated();

    // Step 2: Return 200 OK with full outer join report
    return ok(res, { items });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, 'Could not load FULL OUTER JOIN report.', 500);
  }
}

// Export all controller functions for medicineRoutes.js
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

