// =============================================================================
// medicineRoutes.js - Medicine Inventory & Report Routes
// =============================================================================
// Purpose: Maps medicine inventory CRUD, FEFO, alerts, and join report endpoints.
// =============================================================================

const express = require('express');
const router = express.Router();
const {
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
  getFullOuterReport,
  getRightJoinReport,
} = require('../controllers/medicineController');

// -----------------------------------------------------------------------------
// HTTP GET - Read operations & Reports
// -----------------------------------------------------------------------------
router.get('/api/data', getMedicines);                         // Get all medicines with active batches
router.get('/api/data/:id', getMedicineById);                  // Get single medicine by ID
router.get('/api/medicines/:id', getMedicineById);             // Alias for single medicine by ID
router.get('/api/alerts', getMedicineAlerts);                  // Get expiry and low-stock alerts
router.get('/api/fefo', getFefo);                              // Get FEFO-ordered inventory
router.get('/api/joined-medicines', getJoinedMedicines);        // INNER JOIN report: medicine + category
router.get('/api/reports/missing-batches', getMissingBatchReport); // LEFT JOIN report: medicines with no batch
router.get('/api/reports/full-outer-medicines', getFullOuterReport); // FULL OUTER JOIN report (UNION)
router.get('/api/reports/full-outer-join', getFullOuterReport);      // Alias for FULL OUTER JOIN report
router.get('/api/reports/right-join', getRightJoinReport);           // RIGHT JOIN report: health stations and batches

// -----------------------------------------------------------------------------
// HTTP POST - Create operations
// -----------------------------------------------------------------------------
router.post('/api/data', createMedicine);                      // Add new medicine and batch
router.post('/api/medicines', createMedicine);                 // Alias endpoint for adding medicine
router.post('/api/alerts', createAlertRecord);                 // Create new warning/alert

// -----------------------------------------------------------------------------
// HTTP PUT - Update operations
// -----------------------------------------------------------------------------
router.put('/api/data/:id', updateMedicineRecord);             // Update medicine and batch details
router.put('/api/alerts/:id/resolve', resolveAlertRecord);     // Resolve an alert

// -----------------------------------------------------------------------------
// HTTP DELETE - Delete operations
// -----------------------------------------------------------------------------
router.delete('/api/data/:id', deleteMedicineRecord);          // Safely delete medicine and child records
router.delete('/api/alerts/:id', deleteAlertRecord);           // Dismiss/delete an alert

module.exports = router;
