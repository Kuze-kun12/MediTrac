// =============================================================================
// patientRoutes.js - Patient Routes (Complete CRUD)
// =============================================================================
// Purpose: Maps patient endpoints (GET, POST, PUT, DELETE).
// =============================================================================

const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatientRecord,
  deletePatientRecord,
} = require('../controllers/patientController');

// READ: GET /api/patients -> List all patients
router.get('/api/patients', getPatients);

// READ: GET /api/patients/:id -> Get single patient by ID
router.get('/api/patients/:id', getPatientById);

// CREATE: POST /api/patients -> Add new patient
router.post('/api/patients', createPatient);

// UPDATE: PUT /api/patients/:id -> Update patient
router.put('/api/patients/:id', updatePatientRecord);

// DELETE: DELETE /api/patients/:id -> Remove patient
router.delete('/api/patients/:id', deletePatientRecord);

module.exports = router;
