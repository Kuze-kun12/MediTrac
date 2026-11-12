// =============================================================================
// dispensingModel.js - Dispensing & Atomic Stock Deduction Database Queries
// =============================================================================
// Purpose: Handles medicine distribution logs and atomic stock deductions.
//          Uses a real MySQL TRANSACTION so stock is never double-spent or lost!
// =============================================================================

// Grab our database connection pool
const db = require('../config/db');

/**
 * 1. Get batches with available stock (qty > 0) ordered by earliest expiry (FEFO).
 * Connects medicine_batches + medicines + health_stations.
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
 * Uses LEFT JOIN on patients so walk-ins without an account still appear!
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
 * "Transaction" means: ALL steps must succeed together, or NONE of them happen!
 * If the power goes out halfway, rollback() cancels everything so inventory isn't ruined!
 */
async function addDispensingRecord({ station_id, batch_id, qty, patient_id, patient_name, user_id }) {
  // Convert numbers to make sure they are safe JavaScript integers
  const stationId = Number(station_id);
  const batchId = Number(batch_id);
  const quantity = Number(qty);

  // Validation: Check that station, batch, and quantity are valid
  if (!stationId || !batchId || !quantity || quantity <= 0) {
    throw new Error('Please select a health center, a batch, and a valid quantity.');
  }

  // Borrow one dedicated connection phone-line from our pool for this transaction
  const conn = await db.getConnection();

  try {
    // START TRANSACTION: Tell MySQL "everything from here until commit() is one package deal"
    await conn.beginTransaction();

    // Step A: Check if this batch exists and has enough stock in the pharmacy
    const [batchRows] = await conn.query(
      `SELECT mb.batch_id, mb.batch_no, mb.qty_on_hand, mb.medicine_id, m.generic_name, hs.station_name
       FROM medicine_batches mb
       JOIN medicines m ON m.medicine_id = mb.medicine_id
       LEFT JOIN health_stations hs ON hs.station_id = mb.station_id
       WHERE mb.batch_id = ?`,
      [batchId]
    );

    // If batch ID wasn't found in MySQL
    if (batchRows.length === 0) {
      throw new Error('Selected medicine batch was not found.');
    }

    const batch = batchRows[0];
    // If the clinic only has 5 pills, but you tried to dispense 10 pills: STOP!
    if (batch.qty_on_hand < quantity) {
      throw new Error(`Only ${batch.qty_on_hand} items left in batch ${batch.batch_no}.`);
    }

    // Step B: Resolve Patient ID
    // Find patient by ID, or find them by name, or automatically register a walk-in patient!
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

    // If no valid patient ID was supplied, look up or create one by name
    if (!resolvedPatientId) {
      const finalName = resolvedPatientName || 'Walk-in Patient';
      // Reuse existing patient record if already registered with this exact name
      const [existing] = await conn.query('SELECT patient_id, full_name FROM patients WHERE full_name = ? LIMIT 1', [finalName]);
      if (existing.length > 0) {
        resolvedPatientId = existing[0].patient_id;
        resolvedPatientName = existing[0].full_name;
      } else {
        // Automatically create a patient record so the Foreign Key relationship is happy!
        const [patientResult] = await conn.query(
          'INSERT INTO patients (full_name, birthdate, purok, contact) VALUES (?, ?, ?, ?)',
          [finalName, '2000-01-01', 'Barangay Center', 'N/A']
        );
        resolvedPatientId = patientResult.insertId;
        resolvedPatientName = finalName;
      }
    }

    // Step C: Create dispensing record receipt header
    const fallbackUserId = Number(user_id) || 1;
    const [recordResult] = await conn.query(
      'INSERT INTO dispensing_records (patient_id, user_id, station_id) VALUES (?, ?, ?)',
      [resolvedPatientId, fallbackUserId, stationId]
    );

    // Step D: Insert dispensing item (which medicine, which batch, how many pills)
    await conn.query(
      'INSERT INTO dispensing_items (dispense_id, batch_id, medicine_id, qty) VALUES (?, ?, ?, ?)',
      [recordResult.insertId, batchId, batch.medicine_id, quantity]
    );

    // Step E: Atomically subtract stock from the batch!
    // "WHERE qty_on_hand >= ?" prevents two pharmacists from selling the last pill at the exact same millisecond!
    const [updateResult] = await conn.query(
      'UPDATE medicine_batches SET qty_on_hand = qty_on_hand - ? WHERE batch_id = ? AND qty_on_hand >= ?',
      [quantity, batchId, quantity]
    );

    // If 0 rows were updated, someone else took the stock while we were working!
    if (updateResult.affectedRows === 0) {
      throw new Error('Could not deduct stock. Not enough items on hand.');
    }

    // COMMIT: Everything succeeded! Save all changes permanently to MySQL
    await conn.commit();

    // Return the summary details of the dispensing
    return {
      dispenseId: recordResult.insertId,
      patientName: resolvedPatientName,
      medicine: batch.generic_name,
      batchNo: batch.batch_no,
      qty: quantity,
      station: batch.station_name || 'Health Center',
    };
  } catch (error) {
    // ROLLBACK: Something went wrong! Undo every single change we made above!
    await conn.rollback();
    throw error;
  } finally {
    // Always give the connection back to the pool so other users can use it!
    conn.release();
  }
}

/**
 * 4. Get summary of total medicine distributions to each barangay health station.
 */
async function getBarangayDistributionSummary() {
  // SQL Query:
  // Groups by station and calculates COUNT of distributions and SUM of quantities!
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

// Export all dispensing query functions
module.exports = {
  getAvailableMedicineBatches,
  getDispensingLog,
  addDispensingRecord,
  getBarangayDistributionSummary,
};

