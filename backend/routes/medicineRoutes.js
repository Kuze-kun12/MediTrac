// =============================================================================
// medicineRoutes.js - Medicine Inventory & Reports Doorway
// =============================================================================
// Purpose: Maps all URLs for medicines, FEFO order, safety alerts, and SQL JOIN reports!
// =============================================================================

// Bring in Express for web routing
const express = require('express');

// Create our router map for medicines
const router = express.Router();

// Grab all our medicine controller functions
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
// HTTP GET - Asking for data (Read operations & SQL Reports)
// -----------------------------------------------------------------------------

// 1. Get all medicines and their current stock batches
router.get('/api/data', getMedicines);

// 2. Get details of just one medicine by its ID number
router.get('/api/data/:id', getMedicineById);

// 3. Alternative link for getting one medicine by ID
router.get('/api/medicines/:id', getMedicineById);

// 4. Get expired medicines and medicines that are running low in stock
router.get('/api/alerts', getMedicineAlerts);

// 5. FEFO: Get batches sorted by earliest expiry date first (use first to avoid expiration!)
router.get('/api/fefo', getFefo);

// 6. INNER JOIN Report: Matches medicines with their category names
router.get('/api/joined-medicines', getJoinedMedicines);

// 7. LEFT JOIN Report: Lists all medicines, showing which ones have NO batches
router.get('/api/reports/missing-batches', getMissingBatchReport);

// 8. FULL OUTER JOIN Report: Uses a UNION of left and right joins to show all medicines and batches
router.get('/api/reports/full-outer-medicines', getFullOuterReport);

// 9. Alternative link for the FULL OUTER JOIN report
router.get('/api/reports/full-outer-join', getFullOuterReport);

// 10. RIGHT JOIN Report: Lists all health stations, even if they have no medicine batches yet
router.get('/api/reports/right-join', getRightJoinReport);

// -----------------------------------------------------------------------------
// HTTP POST - Creating brand new data
// -----------------------------------------------------------------------------

// 11. Add a new medicine and its first stock batch
router.post('/api/data', createMedicine);

// 12. Alternative link for adding a new medicine
router.post('/api/medicines', createMedicine);

// 13. Create a manual safety alert
router.post('/api/alerts', createAlertRecord);

// -----------------------------------------------------------------------------
// HTTP PUT - Updating / Changing existing data
// -----------------------------------------------------------------------------

// 14. Update an existing medicine and its batch info by ID
router.put('/api/data/:id', updateMedicineRecord);

// 15. Mark an alert as resolved (fixed/handled)
router.put('/api/alerts/:id/resolve', resolveAlertRecord);

// -----------------------------------------------------------------------------
// HTTP DELETE - Removing data
// -----------------------------------------------------------------------------

// 16. Safely delete a medicine and its connected batches
router.delete('/api/data/:id', deleteMedicineRecord);

// 17. Dismiss / delete an alert permanently
router.delete('/api/alerts/:id', deleteAlertRecord);

// Export this router so server.js can mount it
module.exports = router;

