// =============================================================================
// patientRoutes.js - Patient Doorway (Complete CRUD: Create, Read, Update, Delete)
// =============================================================================
// Purpose: Maps the URLs for managing patients in the clinic/barangay.
// =============================================================================

// Bring in Express to help us handle network requests
const express = require('express');

// Create the router map for all patient endpoints
const router = express.Router();

// Grab all our patient controller handlers
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatientRecord,
  deletePatientRecord,
} = require('../controllers/patientController');

// 1. READ ALL: GET /api/patients -> Returns the list of all patients
router.get('/api/patients', getPatients);

// 2. READ ONE: GET /api/patients/:id -> Returns just one patient based on their ID number
router.get('/api/patients/:id', getPatientById);

// 3. CREATE: POST /api/patients -> Adds a brand new patient to the database
router.post('/api/patients', createPatient);

// 4. UPDATE: PUT /api/patients/:id -> Changes the information of an existing patient
router.put('/api/patients/:id', updatePatientRecord);

// 5. DELETE: DELETE /api/patients/:id -> Permanently deletes a patient by their ID number
router.delete('/api/patients/:id', deletePatientRecord);

// Export this router so server.js can hook it up
module.exports = router;

