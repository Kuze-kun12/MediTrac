 const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineAlerts,
  getFefo,
  getPatients,
} = require('../controllers/medicineController');

// HTTP GET - Read operations
router.get('/api/data', getMedicines);          // GET /api/data -> get all medicines
router.get('/api/alerts', getMedicineAlerts);   // GET /api/alerts -> get stock/expiry alerts
router.get('/api/fefo', getFefo);               // GET /api/fefo -> get FEFO order
router.get('/api/patients', getPatients);       // GET /api/patients -> get all patients



module.exports = router;

