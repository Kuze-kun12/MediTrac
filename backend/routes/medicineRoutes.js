const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineAlerts,
  getFefo,
  getPatients,
  loginUser,
  createMedicine,
  createPatient,
  getJoinedMedicines,
} = require('../controllers/medicineController');

// HTTP GET - Read operations
router.get('/api/data', getMedicines);          // GET /api/data -> get all medicines
router.get('/api/alerts', getMedicineAlerts);   // GET /api/alerts -> get stock/expiry alerts
router.get('/api/fefo', getFefo);               // GET /api/fefo -> get FEFO order
router.get('/api/patients', getPatients);       // GET /api/patients -> get all patients
router.get('/api/joined-medicines', getJoinedMedicines); // GET /api/joined-medicines -> INNER JOIN medicine + category

// HTTP POST - Create operations
router.post('/login', loginUser);               // POST /login -> user login
router.post('/api/medicines', createMedicine);  // POST /api/medicines -> add medicine
router.post('/api/patients', createPatient);    // POST /api/patients -> add patient

module.exports = router;


