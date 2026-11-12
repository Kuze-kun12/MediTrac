// =============================================================================
// patientModel.js - Patient Management Database Queries (Complete CRUD)
// =============================================================================
// Purpose: Handles database queries for Patients (Create, Read, Update, Delete).
// =============================================================================

// Grab our database connection pool
const db = require('../config/db');

/**
 * 1. READ ALL: Get all patients from the database
 */
async function getAllPatients() {
  // Select ID, name, birthday, purok, and contact number
  // ORDER BY patient_id DESC puts the newest registered patients first
  const sql = `
    SELECT 
      patient_id AS id,
      full_name AS fullName,
      birthdate,
      purok,
      contact
    FROM patients
    ORDER BY patient_id DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

/**
 * 1b. READ SINGLE: Get a single patient by their ID number
 */
async function getPatientById(id) {
  // Look up patient matching the specific ID number
  const sql = `
    SELECT 
      patient_id AS id,
      full_name AS fullName,
      birthdate,
      purok,
      contact
    FROM patients
    WHERE patient_id = ?
    LIMIT 1
  `;
  const [rows] = await db.query(sql, [Number(id)]);
  // If found, return the first row; otherwise return null
  return rows.length > 0 ? rows[0] : null;
}

/**
 * 2. CREATE: Add new patient record into MySQL
 */
async function addPatient(data) {
  // SQL INSERT: Put full name, birthday, purok, and phone number into columns
  const sql = `
    INSERT INTO patients (full_name, birthdate, purok, contact)
    VALUES (?, ?, ?, ?)
  `;
  const values = [
    data.full_name || data.fullName,
    data.birthdate,
    data.purok,
    data.contact || 'N/A', // Default to 'N/A' if they don't have a phone
  ];

  const [result] = await db.query(sql, values);
  // Return the newly created patient_id number
  return { id: result.insertId };
}

/**
 * 3. UPDATE: Update an existing patient's details by their ID
 */
async function updatePatient(id, data) {
  // SQL UPDATE: Overwrite name, birthday, purok, and contact for the matching patient_id
  const sql = `
    UPDATE patients
    SET full_name = ?, birthdate = ?, purok = ?, contact = ?
    WHERE patient_id = ?
  `;
  const values = [
    data.full_name || data.fullName,
    data.birthdate,
    data.purok,
    data.contact || 'N/A',
    Number(id),
  ];

  const [result] = await db.query(sql, values);
  // If 0 rows were changed, that patient ID was not in the database
  if (result.affectedRows === 0) return { success: false, notFound: true };
  return { success: true };
}

/**
 * 4. DELETE: Remove patient by ID safely.
 * Foreign Key Rule: If a patient has past medicine dispensings, MySQL won't let you delete them
 * unless you delete their connected dispensing history first!
 * Step A: Delete dispensing_items connected to this patient
 * Step B: Delete dispensing_records connected to this patient
 * Step C: Finally, safely delete the patient!
 */
async function deletePatient(id) {
  const patientId = Number(id);

  // Step A: Remove medicine items linked to this patient's dispensing records
  await db.query(
    `DELETE di FROM dispensing_items di
     JOIN dispensing_records dr ON dr.dispense_id = di.dispense_id
     WHERE dr.patient_id = ?`,
    [patientId]
  );

  // Step B: Remove the dispensing records header for this patient
  await db.query('DELETE FROM dispensing_records WHERE patient_id = ?', [patientId]);

  // Step C: Now safely delete the patient from the patients table!
  const sql = 'DELETE FROM patients WHERE patient_id = ?';
  const [result] = await db.query(sql, [patientId]);
  if (result.affectedRows === 0) return { success: false, notFound: true };
  return { success: true };
}

// Export all patient query functions
module.exports = {
  getAllPatients,
  getPatientById,
  addPatient,
  updatePatient,
  deletePatient,
};

