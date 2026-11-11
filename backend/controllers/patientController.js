// =============================================================================
// patientController.js - Patient Management Controller
// =============================================================================
// Handles CRUD requests for Patient records.
// =============================================================================

const model = require('../models/patientModel');
const { ok, bad } = require('../utils/response');

// 1. GET /api/patients - Get all registered patients
async function getPatients(req, res) {
  try {
    const items = await model.getAllPatients();
    return ok(res, { items });
  } catch (err) {
    return bad(res, 'Could not load patients.', 500);
  }
}

// 1b. GET /api/patients/:id - Get patient by ID
async function getPatientById(req, res) {
  try {
    const item = await model.getPatientById(req.params.id);
    if (!item) {
      return bad(res, 'Patient not found.', 404);
    }
    return ok(res, { item });
  } catch (err) {
    return bad(res, 'Could not load patient.', 500);
  }
}

// 2. POST /api/patients - Register new patient
async function createPatient(req, res) {
  const { full_name, fullName, birthdate, purok, contact } = req.body;
  const name = full_name || fullName;

  if (!name || !birthdate || !purok) {
    return bad(res, 'Name, birthdate, and purok are required.', 400);
  }

  try {
    const result = await model.addPatient({ full_name: name, birthdate, purok, contact });
    return ok(res, { message: 'Patient added successfully.', id: result.id }, 201);
  } catch (err) {
    return bad(res, err.message || 'Could not add patient.', 500);
  }
}

// 3. PUT /api/patients/:id - Update patient
async function updatePatientRecord(req, res) {
  try {
    const result = await model.updatePatient(req.params.id, req.body);
    if (result.notFound) {
      return bad(res, 'Patient not found.', 404);
    }
    return ok(res, { message: 'Patient updated successfully.' });
  } catch (err) {
    return bad(res, err.message || 'Could not update patient.', 500);
  }
}

// 4. DELETE /api/patients/:id - Delete patient
async function deletePatientRecord(req, res) {
  try {
    const result = await model.deletePatient(req.params.id);
    if (result.notFound) {
      return bad(res, 'Patient not found.', 404);
    }
    return ok(res, { message: 'Patient deleted successfully.' });
  } catch (err) {
    return bad(res, err.message || 'Could not delete patient.', 500);
  }
}

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatientRecord,
  deletePatientRecord,
};
