// =============================================================================
// patientController.js - Patient Records Brain / Controller (Complete CRUD)
// =============================================================================
// Purpose: Handles requests to view, add, edit, or delete patient clinic records.
// =============================================================================

// Grab our database model that handles SQL queries for the patients table
const model = require('../models/patientModel');

// Grab our response helpers (ok sends success 200/201, bad sends error 400/404/500)
const { ok, bad } = require('../utils/response');

// 1. GET /api/patients - Get all registered patients
async function getPatients(req, res) {
  try {
    // Step 1: Ask the database model for all patient rows
    const items = await model.getAllPatients();

    // Step 2: Send back 200 OK with the patient list inside { items: [...] }
    return ok(res, { items });
  } catch (err) {
    // 500 Server Error if the database query fails
    return bad(res, 'Could not load patients.', 500);
  }
}

// 1b. GET /api/patients/:id - Get just one patient by their ID number
async function getPatientById(req, res) {
  try {
    // Step 1: Look up the patient using the ID from the URL (req.params.id)
    const item = await model.getPatientById(req.params.id);

    // Step 2: If no patient was found with that ID number
    if (!item) {
      // 404 Not Found: "Sorry, cannot find this patient!"
      return bad(res, 'Patient not found.', 404);
    }

    // Step 3: Return 200 OK with the single patient's info
    return ok(res, { item });
  } catch (err) {
    // 500 Server Error if query fails
    return bad(res, 'Could not load patient.', 500);
  }
}

// 2. POST /api/patients - Register a brand new patient
async function createPatient(req, res) {
  // Step 1: Unpack what was typed in the registration form
  const { full_name, fullName, birthdate, purok, contact } = req.body;
  const name = full_name || fullName; // Support either camelCase or snake_case

  // Step 2: Make sure the required boxes are NOT empty (name, birthday, purok)
  if (!name || !birthdate || !purok) {
    // 400 Bad Request: Tell user they forgot required information
    return bad(res, 'Name, birthdate, and purok are required.', 400);
  }

  try {
    // Step 3: Tell the model to insert the new patient into the database
    const result = await model.addPatient({ full_name: name, birthdate, purok, contact });

    // Step 4: Return 201 Created with the new patient's ID number!
    return ok(res, { message: 'Patient added successfully.', id: result.id }, 201);
  } catch (err) {
    // 500 Server Error if insert fails
    return bad(res, err.message || 'Could not add patient.', 500);
  }
}

// 3. PUT /api/patients/:id - Update an existing patient's details
async function updatePatientRecord(req, res) {
  try {
    // Step 1: Tell the model to update the patient matching this ID with the new data
    const result = await model.updatePatient(req.params.id, req.body);

    // Step 2: If the patient ID doesn't exist in the database
    if (result.notFound) {
      // 404 Not Found
      return bad(res, 'Patient not found.', 404);
    }

    // Step 3: Return 200 OK: Patient updated!
    return ok(res, { message: 'Patient updated successfully.' });
  } catch (err) {
    // 500 Server Error if update fails
    return bad(res, err.message || 'Could not update patient.', 500);
  }
}

// 4. DELETE /api/patients/:id - Delete a patient record permanently
async function deletePatientRecord(req, res) {
  try {
    // Step 1: Tell the model to delete the patient and clean up related records
    const result = await model.deletePatient(req.params.id);

    // Step 2: If that patient ID wasn't found in the database
    if (result.notFound) {
      // 404 Not Found
      return bad(res, 'Patient not found.', 404);
    }

    // Step 3: Return 200 OK: Patient successfully deleted!
    return ok(res, { message: 'Patient deleted successfully.' });
  } catch (err) {
    // 500 Server Error if deletion fails
    return bad(res, err.message || 'Could not delete patient.', 500);
  }
}

// Export all 5 controller handlers for patientRoutes.js
module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatientRecord,
  deletePatientRecord,
};

