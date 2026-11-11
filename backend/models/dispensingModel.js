// =============================================================================
// dispensingModel.js - Dispensing & Inventory Deduction Model
// =============================================================================
// Purpose: Handles medicine distribution logs and atomic stock deductions.
// =============================================================================

const db = require('../config/db');

/**
 * 1. Get batches with available stock (qty > 0) ordered by earliest expiry (FEFO).
 */
async function getAvailableMedicineBatches() {
  const sql = `
    SELECT
      mb.batch_id AS id,
      mb.batch_no AS batchNo,
      m.generic_name AS medName,
      m.strength,
      m.dosage_form AS dosageForm,
      m.unit,
      mb.qty_on_hand AS qtyOnHand,
      mb.expiry_date AS expiry,
      hs.station_name AS barangay
    FROM medicine_batches mb
    JOIN medicines m ON m.medicine_id = mb.medicine_id
    LEFT JOIN health_stations hs ON hs.station_id = mb.station_id
    WHERE mb.qty_on_hand > 0
    ORDER BY mb.expiry_date ASC
  `;

  const [rows] = await db.query(sql);
  return rows;
}

/**
 * 2. Get recent dispensing log entries.
 * Uses LEFT JOIN on patients so records without a linked patient still appear.
 */
async function getDispensingLog() {
  const sql = `
    SELECT
      dr.dispense_id AS id,
      p.patient_id AS patientId,
      COALESCE(p.full_name, 'Unknown') AS patientName,
      hs.station_name AS barangay,
      m.generic_name AS medName,
      mb.batch_no AS batchNo,
      di.qty,
      dr.dispensed_at AS dispensedAt
    FROM dispensing_records dr
    LEFT JOIN patients p ON p.patient_id = dr.patient_id
    JOIN dispensing_items di ON di.dispense_id = dr.dispense_id
    JOIN medicine_batches mb ON mb.batch_id = di.batch_id
    JOIN medicines m ON m.medicine_id = di.medicine_id
    LEFT JOIN health_stations hs ON hs.station_id = dr.station_id
    ORDER BY dr.dispensed_at DESC
    LIMIT 30
  `;

  const [rows] = await db.query(sql);
  return rows;
}

/**
 * 3. Save a dispensing record and deduct stock using a MySQL Transaction.
 * Supports dispensing to an existing patient_id OR new patient_name.
 */
async function addDispensingRecord({ station_id, batch_id, qty, patient_id, patient_name, user_id }) {
  const stationId = Number(station_id);
  const batchId = Number(batch_id);
  const quantity = Number(qty);

  if (!stationId || !batchId || !quantity || quantity <= 0) {
    throw new Error('Please select a health center, a batch, and a valid quantity.');
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Step A: Check if batch exists and has enough stock
    const [batchRows] = await conn.query(
      `SELECT mb.batch_id, mb.batch_no, mb.qty_on_hand, mb.medicine_id, m.generic_name, hs.station_name
       FROM medicine_batches mb
       JOIN medicines m ON m.medicine_id = mb.medicine_id
       LEFT JOIN health_stations hs ON hs.station_id = mb.station_id
       WHERE mb.batch_id = ?`,
      [batchId]
    );

    if (batchRows.length === 0) {
      throw new Error('Selected medicine batch was not found.');
    }

    const batch = batchRows[0];
    if (batch.qty_on_hand < quantity) {
      throw new Error(`Only ${batch.qty_on_hand} items left in batch ${batch.batch_no}.`);
    }

    // Step B: Resolve Patient ID
    // If a valid patient_id is provided, verify it exists.
    // If not found or if patient_name is given (walk-in patient or barangay dispatch),
    // find existing patient by name or register them in the patients table to satisfy FK.
    let resolvedPatientId = Number(patient_id);
    let resolvedPatientName = patient_name ? String(patient_name).trim() : '';

    if (resolvedPatientId && !isNaN(resolvedPatientId)) {
      const [pRows] = await conn.query('SELECT patient_id, full_name FROM patients WHERE patient_id = ?', [resolvedPatientId]);
      if (pRows.length > 0) {
        resolvedPatientName = pRows[0].full_name;
      } else {
        resolvedPatientId = null;
      }
    }

    if (!resolvedPatientId) {
      const finalName = resolvedPatientName || 'Walk-in Patient';
      // Reuse existing patient record if already registered with the same name
      const [existing] = await conn.query('SELECT patient_id, full_name FROM patients WHERE full_name = ? LIMIT 1', [finalName]);
      if (existing.length > 0) {
        resolvedPatientId = existing[0].patient_id;
        resolvedPatientName = existing[0].full_name;
      } else {
        const [patientResult] = await conn.query(
          'INSERT INTO patients (full_name, birthdate, purok, contact) VALUES (?, ?, ?, ?)',
          [finalName, '2000-01-01', 'Barangay Center', 'N/A']
        );
        resolvedPatientId = patientResult.insertId;
        resolvedPatientName = finalName;
      }
    }

    // Step C: Create dispensing record header
    const fallbackUserId = Number(user_id) || 1;
    const [recordResult] = await conn.query(
      'INSERT INTO dispensing_records (patient_id, user_id, station_id) VALUES (?, ?, ?)',
      [resolvedPatientId, fallbackUserId, stationId]
    );

    // Step D: Insert dispensing item
    await conn.query(
      'INSERT INTO dispensing_items (dispense_id, batch_id, medicine_id, qty) VALUES (?, ?, ?, ?)',
      [recordResult.insertId, batchId, batch.medicine_id, quantity]
    );

    // Step E: Atomically subtract stock from the batch
    const [updateResult] = await conn.query(
      'UPDATE medicine_batches SET qty_on_hand = qty_on_hand - ? WHERE batch_id = ? AND qty_on_hand >= ?',
      [quantity, batchId, quantity]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error('Could not deduct stock. Not enough items on hand.');
    }

    await conn.commit();

    return {
      dispenseId: recordResult.insertId,
      patientName: resolvedPatientName,
      medicine: batch.generic_name,
      batchNo: batch.batch_no,
      qty: quantity,
      station: batch.station_name || 'Health Center',
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * 4. Get summary of distribution to each barangay health station.
 */
async function getBarangayDistributionSummary() {
  const sql = `
    SELECT
      hs.station_id AS stationId,
      hs.station_name AS stationName,
      hs.address,
      COUNT(DISTINCT dr.dispense_id) AS totalDistributions,
      COALESCE(SUM(di.qty), 0) AS totalQtyDistributed
    FROM health_stations hs
    LEFT JOIN dispensing_records dr ON dr.station_id = hs.station_id
    LEFT JOIN dispensing_items di ON di.dispense_id = dr.dispense_id
    GROUP BY hs.station_id, hs.station_name, hs.address
    ORDER BY hs.station_name ASC
  `;

  const [rows] = await db.query(sql);
  return rows;
}

module.exports = {
  getAvailableMedicineBatches,
  getDispensingLog,
  addDispensingRecord,
  getBarangayDistributionSummary,
};
