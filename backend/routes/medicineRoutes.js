const db = require('../config/db');

// Helper: Get ID of existing item by name, or insert it and get new ID
async function findOrCreate(table, idCol, nameCol, val, fallback = 'General') {
  const name = String(val || fallback).trim();
  const [rows] = await db.query(`SELECT ${idCol} FROM ${table} WHERE ${nameCol} = ?`, [name]);
  if (rows.length > 0) return rows[0][idCol];

  // Specific inserts for tables with NOT NULL columns without default values
  if (table === 'health_stations') {
    const [res] = await db.query(
      `INSERT INTO health_stations (station_name, address) VALUES (?, ?)`,
      [name, 'Barangay Health Center']
    );
    return res.insertId;
  }

  if (table === 'suppliers') {
    const [res] = await db.query(
      `INSERT INTO suppliers (supplier_name, contact) VALUES (?, ?)`,
      [name, 'N/A']
    );
    return res.insertId;
  }

  const [res] = await db.query(`INSERT INTO ${table} (${nameCol}) VALUES (?)`, [name]);
  return res.insertId;
}

// 1. READ: Get all medicines with category, batch, and station info
async function getAllMedicines() {
  const sql = `
    SELECT
      m.medicine_id AS id,
      m.generic_name AS medName,
      m.strength,
      m.dosage_form AS dosageForm,
      m.unit,
      m.reorder_level AS reorderLevel,
      c.category_name AS category,
      hs.station_name AS barangay,
      b.batch_no AS batchNo,
      b.qty_on_hand AS qtyOnHand,
      b.expiry_date AS expiry
    FROM medicines m
    LEFT JOIN medicine_categories c ON c.category_id = m.category_id
    LEFT JOIN medicine_batches b ON b.medicine_id = m.medicine_id
    LEFT JOIN health_stations hs ON hs.station_id = b.station_id
    ORDER BY m.medicine_id ASC, b.expiry_date ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// 1b. READ SINGLE: Get medicine by ID
async function getMedicineById(id) {
  const sql = `
    SELECT
      m.medicine_id AS id,
      m.generic_name AS medName,
      m.strength,
      m.dosage_form AS dosageForm,
      m.unit,
      m.reorder_level AS reorderLevel,
      c.category_name AS category,
      hs.station_name AS barangay,
      b.batch_no AS batchNo,
      b.qty_on_hand AS qtyOnHand,
      b.expiry_date AS expiry
    FROM medicines m
    LEFT JOIN medicine_categories c ON c.category_id = m.category_id
    LEFT JOIN medicine_batches b ON b.medicine_id = m.medicine_id
    LEFT JOIN health_stations hs ON hs.station_id = b.station_id
    WHERE m.medicine_id = ?
    ORDER BY b.expiry_date ASC
    LIMIT 1
  `;
  const [rows] = await db.query(sql, [Number(id)]);
  return rows.length > 0 ? rows[0] : null;
}

// 2. CREATE: Add new generic medicine and its initial stock batch
async function addMedicine(data) {
  const categoryId = await findOrCreate('medicine_categories', 'category_id', 'category_name', data.category || data.category_name);
  const stationId = await findOrCreate('health_stations', 'station_id', 'station_name', data.barangay, 'Central Health Center');
  const supplierId = data.supplier ? await findOrCreate('suppliers', 'supplier_id', 'supplier_name', data.supplier, 'MedPharma Global') : 1;

  // Insert medicine header
  const [med] = await db.query(
    'INSERT INTO medicines (generic_name, strength, dosage_form, unit, reorder_level, category_id) VALUES (?, ?, ?, ?, ?, ?)',
    [
      data.medName || data.generic_name,
      data.strength || 'N/A',
      data.dosageForm || data.dosage_form || 'Tablet',
      data.unit || 'pcs',
      Number(data.reorderLevel || data.reorder_level || 0),
      categoryId,
    ]
  );

  // Insert initial stock batch
  await db.query(
    'INSERT INTO medicine_batches (batch_no, medicine_id, supplier_id, station_id, expiry_date, qty_on_hand, unit_cost, received_date) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())',
    [
      data.batchNo || data.batch_no,
      med.insertId,
      supplierId,
      stationId,
      data.expiry || data.expiry_date,
      Number(data.qtyOnHand || data.qty_on_hand || 0),
      Number(data.unitCost || data.unit_cost || 0),
    ]
  );

  return { success: true, id: med.insertId };
}

// 3. UPDATE: Update medicine details and latest batch
async function updateMedicine(id, data) {
  const medicineId = Number(id);
  const [chk] = await db.query('SELECT medicine_id FROM medicines WHERE medicine_id = ?', [medicineId]);
  if (chk.length === 0) return { success: false, notFound: true };

  const categoryId = await findOrCreate('medicine_categories', 'category_id', 'category_name', data.category || data.category_name);
  const stationId = await findOrCreate('health_stations', 'station_id', 'station_name', data.barangay, 'Central Health Center');

  await db.query(
    'UPDATE medicines SET generic_name=?, strength=?, dosage_form=?, unit=?, reorder_level=?, category_id=? WHERE medicine_id=?',
    [
      data.medName || data.generic_name,
      data.strength || 'N/A',
      data.dosageForm || data.dosage_form || 'Tablet',
      data.unit || 'pcs',
      Number(data.reorderLevel || data.reorder_level || 0),
      categoryId,
      medicineId,
    ]
  );

  await db.query(
    'UPDATE medicine_batches SET batch_no=?, expiry_date=?, qty_on_hand=?, station_id=? WHERE medicine_id=? ORDER BY batch_id DESC LIMIT 1',
    [
      data.batchNo || data.batch_no,
      data.expiry || data.expiry_date,
      Number(data.qtyOnHand || data.qty_on_hand || 0),
      stationId,
      medicineId,
    ]
  );

  return { success: true };
}

// 4. DELETE: Safely remove a medicine and child records
async function deleteMedicine(id) {
  const medicineId = Number(id);
  const [chk] = await db.query('SELECT medicine_id FROM medicines WHERE medicine_id = ?', [medicineId]);
  if (chk.length === 0) return { success: false, notFound: true };

  await db.query('DELETE FROM dispensing_items WHERE medicine_id = ?', [medicineId]);
  await db.query('DELETE FROM alerts WHERE medicine_id = ?', [medicineId]);
  await db.query('DELETE FROM medicine_batches WHERE medicine_id = ?', [medicineId]);
  await db.query('DELETE FROM medicines WHERE medicine_id = ?', [medicineId]);
  return { success: true };
}

// 5. FEFO: Order batches by earliest expiration date first
async function getFefoOrder() {
  const sql = `
    SELECT m.medicine_id, m.generic_name, b.batch_no, b.expiry_date, b.qty_on_hand
    FROM medicine_batches b
    JOIN medicines m ON m.medicine_id = b.medicine_id
    WHERE b.qty_on_hand > 0
    ORDER BY b.expiry_date ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// 6. ALERTS: Batches that are expired OR below safety reorder level
async function getAlerts() {
  const sql = `
    SELECT b.batch_id, b.batch_no, m.generic_name, b.expiry_date, b.qty_on_hand, m.reorder_level
    FROM medicine_batches b
    JOIN medicines m ON m.medicine_id = b.medicine_id
    WHERE b.expiry_date < CURDATE() OR b.qty_on_hand <= m.reorder_level
    ORDER BY b.expiry_date ASC, b.qty_on_hand ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// =============================================================================
// REQUIRED SQL JOIN QUERIES (For DBMS 1 Defense)
// =============================================================================

// 7. INNER JOIN: Only returns rows where medicine has a matching category
async function getMedicinesWithCategory() {
  const sql = `
    SELECT m.medicine_id AS id, m.generic_name, m.strength, c.category_name AS category
    FROM medicines m
    INNER JOIN medicine_categories c ON c.category_id = m.category_id
    ORDER BY m.medicine_id ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// 8. LEFT JOIN: Keeps all medicines; shows NULL if a medicine has no stock batch
async function getMedicinesWithMissingBatch() {
  const sql = `
    SELECT m.medicine_id, m.generic_name, b.batch_id, b.batch_no
    FROM medicines m
    LEFT JOIN medicine_batches b ON b.medicine_id = m.medicine_id
    WHERE b.batch_id IS NULL
    ORDER BY m.medicine_id ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// 9. RIGHT JOIN: Keeps all health stations; shows NULL if a station has no batches
async function getStationsWithBatchesRightJoin() {
  const sql = `
    SELECT hs.station_id AS stationId, hs.station_name AS stationName, hs.address,
           b.batch_no AS batchNo, m.generic_name AS medName, b.qty_on_hand AS qtyOnHand
    FROM medicine_batches b
    RIGHT JOIN health_stations hs ON hs.station_id = b.station_id
    LEFT JOIN medicines m ON m.medicine_id = b.medicine_id
    ORDER BY hs.station_id ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// 10. FULL OUTER JOIN: Keeps all medicines & batches (simulated with UNION in MySQL)
async function getMedicineFullOuterJoinSimulated() {
  const sql = `
    SELECT m.medicine_id AS id, m.generic_name AS medName, b.batch_no AS batchNo, b.qty_on_hand AS qtyOnHand, b.expiry_date AS expiry
    FROM medicines m
    LEFT JOIN medicine_batches b ON b.medicine_id = m.medicine_id
    UNION
    SELECT m.medicine_id AS id, m.generic_name AS medName, b.batch_no AS batchNo, b.qty_on_hand AS qtyOnHand, b.expiry_date AS expiry
    FROM medicines m
    RIGHT JOIN medicine_batches b ON b.medicine_id = m.medicine_id
    ORDER BY id ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// 11. ALERTS MANAGEMENT (CRUD)
async function createAlert({ alert_type, medicine_id, batch_id }) {
  const [res] = await db.query(
    'INSERT INTO alerts (alert_type, medicine_id, batch_id, created_at) VALUES (?, ?, ?, NOW())',
    [alert_type || 'safety_warning', Number(medicine_id) || 1, Number(batch_id) || 1]
  );
  return { id: res.insertId };
}

async function resolveAlert(id) {
  const [res] = await db.query('UPDATE alerts SET resolved_at = NOW() WHERE alert_id = ?', [Number(id)]);
  if (res.affectedRows === 0) return { success: false, notFound: true };
  return { success: true };
}

async function deleteAlert(id) {
  const [res] = await db.query('DELETE FROM alerts WHERE alert_id = ?', [Number(id)]);
  if (res.affectedRows === 0) return { success: false, notFound: true };
  return { success: true };
}

module.exports = {
  getAllMedicines,
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getFefoOrder,
  getAlerts,
  createAlert,
  resolveAlert,
  deleteAlert,
  getMedicinesWithCategory,
  getMedicinesWithMissingBatch,
  getStationsWithBatchesRightJoin,
  getMedicineFullOuterJoinSimulated,
};