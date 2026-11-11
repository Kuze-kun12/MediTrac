// =============================================================================
// patientModel.js - Patient Management Model (Complete CRUD)
// =============================================================================
// Purpose: Handles database queries for Patients (Create, Read, Update, Delete).
// =============================================================================

const db = require('../config/db');

/**
 * 1. READ: Get all patients from database
 */
async function getAllPatients() {
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
 * 1b. READ SINGLE: Get patient by ID
 */
async function getPatientById(id) {
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
  return rows.length > 0 ? rows[0] : null;
}

/**
 * 2. CREATE: Add new patient record
 */
async function addPatient(data) {
  const sql = `
    INSERT INTO patients (full_name, birthdate, purok, contact)
    VALUES (?, ?, ?, ?)
  `;
  const values = [
    data.full_name || data.fullName,
    data.birthdate,
    data.purok,
    data.contact || 'N/A',
  ];

  const [result] = await db.query(sql, values);
  return { id: result.insertId };
}

/**
 * 3. UPDATE: Update existing patient by ID
 */
async function updatePatient(id, data) {
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
  if (result.affectedRows === 0) return { success: false, notFound: true };
  return { success: true };
}

/**
 * 4. DELETE: Remove patient by ID.
 * Clears related dispensing_items and dispensing_records first to avoid
 * foreign key constraint errors, then deletes the patient row.
 */
async function deletePatient(id) {
  const patientId = Number(id);

  // Remove dispensing_items linked to this patient's dispensing_records
  await db.query(
    `DELETE di FROM dispensing_items di
     JOIN dispensing_records dr ON dr.dispense_id = di.dispense_id
     WHERE dr.patient_id = ?`,
    [patientId]
  );

  // Remove dispensing_records for this patient
  await db.query('DELETE FROM dispensing_records WHERE patient_id = ?', [patientId]);

  // Now safely delete the patient
  const sql = 'DELETE FROM patients WHERE patient_id = ?';
  const [result] = await db.query(sql, [patientId]);
  if (result.affectedRows === 0) return { success: false, notFound: true };
  return { success: true };
}

module.exports = {
  getAllPatients,
  getPatientById,
  addPatient,
  updatePatient,
  deletePatient,
};
