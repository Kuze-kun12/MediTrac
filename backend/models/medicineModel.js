//jero
//connect the db
const db = require('../config/db');

//create functions to get data from the database
//join tables to get the data from the database
function getAllMedicines() {
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
    ORDER BY m.medicine_id, b.expiry_date
  `;

  return db.query(sql).then(([rows]) => rows);
}

//create function to get alerts from the database
function getAlerts() {
  const sql = `
    SELECT
      b.batch_id,
      b.batch_no,
      m.generic_name,
      b.expiry_date,
      b.qty_on_hand,
      m.reorder_level
    FROM medicine_batches b
    JOIN medicines m ON m.medicine_id = b.medicine_id
    WHERE b.expiry_date < CURDATE()
       OR b.qty_on_hand <= m.reorder_level
    ORDER BY b.expiry_date ASC, b.qty_on_hand ASC
  `;

  return db.query(sql).then(([rows]) => rows);
}

//create function to get FEFO order from the database
function getFefoOrder() {
  const sql = `
    SELECT
      m.medicine_id,
      m.generic_name,
      b.batch_id,
      b.batch_no,
      b.expiry_date,
      b.qty_on_hand,
      m.reorder_level
    FROM medicine_batches b
    JOIN medicines m ON m.medicine_id = b.medicine_id
    WHERE b.qty_on_hand > 0
    ORDER BY b.expiry_date ASC
  `;

  return db.query(sql).then(([rows]) => rows);
}

//create function to get user by login from the database
function getUserByLogin(username, password) {
  const sql = `
    SELECT u.*, r.role_name
    FROM users u
    LEFT JOIN roles r ON r.role_id = u.role_id
    WHERE u.username = ? AND u.password_hash = ?
  `;

  return db.query(sql, [username, password]).then(([rows]) => rows);
}


async function getOrCreateRow(table, fieldName, value, insertSql, insertValues) {
  const [rows] = await db.query(`SELECT * FROM ${table} WHERE ${fieldName} = ?, [value]`);

  if (rows.length > 0) {
    return rows[0].id || rows[0][Object.keys(rows[0])[0]];
  }

  const [result] = await db.query(insertSql, insertValues);
  return result.insertId;
}

//create function to add medicine to the database
async function addMedicine(data) {
  const categoryName = data.category_name || 'General';
  const supplierName = data.supplier_name || 'MedPharma Global';
  const barangayName = String(data.barangay || data.station_name || 'Central Health Center').trim() || 'Central Health Center';
  const stationName = barangayName;

// Get or create category, supplier, and station IDs
  const categoryId = await getOrCreateRow(
    'medicine_categories',
    'category_name',
    categoryName,
    'INSERT INTO medicine_categories (category_name) VALUES (?)',
    [categoryName]
  );


// Get or create supplier and station IDs
  const supplierId = await getOrCreateRow(
    'suppliers',
    'supplier_name',
    supplierName,
    'INSERT INTO suppliers (supplier_name, contact) VALUES (?, ?)',
    [supplierName, 'N/A']
  );

// Get or create station ID
  const stationId = await getOrCreateRow(
    'health_stations',
    'station_name',
    stationName,
    'INSERT INTO health_stations (station_name, address) VALUES (?, ?)',
    [stationName, 'N/A']
  );

// Insert the medicine and its batch into the database
  const [medicineResult] = await db.query(
    'INSERT INTO medicines (generic_name, strength, dosage_form, unit, reorder_level, category_id) VALUES (?, ?, ?, ?, ?, ?)',
    [
      String(data.generic_name).trim(),
      String(data.strength).trim(),
      String(data.dosage_form).trim(),
      String(data.unit).trim(),
      Number(data.reorder_level),
      Number(categoryId),
    ]
  );


// Insert the batch for the newly created medicine
  await db.query(
    'INSERT INTO medicine_batches (batch_no, medicine_id, supplier_id, station_id, expiry_date, qty_on_hand, unit_cost, received_date) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())',
    [
      String(data.batch_no).trim(),
      medicineResult.insertId,
      Number(supplierId),
      Number(stationId),
      data.expiry_date,
      Number(data.qty_on_hand),
      Number(data.unit_cost || 0),
    ]
  );

  return { success: true };
}


//create function to update medicine in the database
async function updateMedicine(id, data) {
  const categoryName = data.category_name || 'General';
  const categoryId = await getOrCreateRow(
    'medicine_categories',
    'category_name',
    categoryName,
    'INSERT INTO medicine_categories (category_name) VALUES (?)',
    [categoryName]
  );

// Update the medicine record
  await db.query(
    `UPDATE medicines
     SET generic_name = ?, strength = ?, dosage_form = ?, unit = ?, reorder_level = ?, category_id = ?
     WHERE medicine_id = ?`,
    [
      String(data.generic_name).trim(),
      String(data.strength).trim(),
      String(data.dosage_form).trim(),
      String(data.unit).trim(),
      Number(data.reorder_level),
      Number(categoryId),
      Number(id),
    ]
  );

// Update or insert the batch record
  const supplierName = data.supplier_name || 'MedPharma Global';
  const barangayName = String(data.barangay || data.station_name || 'Central Health Center').trim() || 'Central Health Center';
  const stationName = barangayName;

  const supplierId = await getOrCreateRow(
    'suppliers',
    'supplier_name',
    supplierName,
    'INSERT INTO suppliers (supplier_name, contact) VALUES (?, ?)',
    [supplierName, 'N/A']
  );

// Get or create station ID
  const stationId = await getOrCreateRow(
    'health_stations',
    'station_name',
    stationName,
    'INSERT INTO health_stations (station_name, address) VALUES (?, ?)',
    [stationName, 'N/A']
  );


// Get the latest batch for the medicine
  const [batchRows] = await db.query(
    'SELECT * FROM medicine_batches WHERE medicine_id = ? ORDER BY batch_id DESC LIMIT 1',
    [Number(id)]
  );

//
  const batchNo = data.batch_no ? String(data.batch_no).trim() : (batchRows[0]?.batch_no || 'BATCH-NEW');
  const expiryDate = data.expiry_date || (batchRows[0]?.expiry_date || '2027-12-31');
  const qty = Number(data.qty_on_hand || batchRows[0]?.qty_on_hand || 0);

  if (batchRows.length > 0) {
    await db.query(
      `UPDATE medicine_batches
       SET batch_no = ?, expiry_date = ?, qty_on_hand = ?, supplier_id = ?, station_id = ?
       WHERE batch_id = ?`,
      [batchNo, expiryDate, qty, Number(supplierId), Number(stationId), batchRows[0].batch_id]
    );
  } else {
    await db.query(
      'INSERT INTO medicine_batches (batch_no, medicine_id, supplier_id, station_id, expiry_date, qty_on_hand, unit_cost, received_date) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())',
      [
        batchNo,
        Number(id),
        Number(supplierId),
        Number(stationId),
        expiryDate,
        qty,
        Number(data.unit_cost || 0),
      ]
    );
  }

  return { success: true };
}

async function deleteMedicine(id) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query('DELETE FROM medicine_batches WHERE medicine_id = ?', [Number(id)]);
    await conn.query('DELETE FROM medicines WHERE medicine_id = ?', [Number(id)]);

    const [[medicineMax]] = await conn.query('SELECT COALESCE(MAX(medicine_id), 0) AS max_id FROM medicines');
    const nextMedicineId = Math.max(1, Number(medicineMax.max_id) + 1);
    await conn.query('ALTER TABLE medicines AUTO_INCREMENT = ?', [nextMedicineId]);

    const [[batchMax]] = await conn.query('SELECT COALESCE(MAX(batch_id), 0) AS max_id FROM medicine_batches');
    const nextBatchId = Math.max(1, Number(batchMax.max_id) + 1);
    await conn.query('ALTER TABLE medicine_batches AUTO_INCREMENT = ?', [nextBatchId]);

    await conn.commit();
    return { success: true };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

function getAllPatients() {
  const sql = `
    SELECT
      patient_id AS id,
      full_name AS fullName,
      birthdate,
      purok,
      contact
    FROM patients
    ORDER BY patient_id
  `;

  return db.query(sql).then(([rows]) => rows);
}

async function addPatient(data) {
  const fullName = String(data.full_name || data.fullName || '').trim();
  const birthdate = data.birthdate || '';
  const purok = String(data.purok || '').trim();
  const contact = String(data.contact || '').trim();

  if (!fullName || !birthdate || !purok) {
    throw new Error('Patient name, birthdate and purok are required.');
  }

  const [result] = await db.query(
    'INSERT INTO patients (full_name, birthdate, purok, contact) VALUES (?, ?, ?, ?)',
    [fullName, birthdate, purok, contact]
  );

  return { success: true, id: result.insertId };
}

async function updatePatient(id, data) {
  const fullName = String(data.full_name || data.fullName || '').trim();
  const birthdate = data.birthdate || '';
  const purok = String(data.purok || '').trim();
  const contact = String(data.contact || '').trim();

  if (!fullName || !birthdate || !purok) {
    throw new Error('Patient name, birthdate and purok are required.');
  }

  await db.query(
    `UPDATE patients
     SET full_name = ?, birthdate = ?, purok = ?, contact = ?
     WHERE patient_id = ?`,
    [fullName, birthdate, purok, contact, Number(id)]
  );

  return { success: true };
}

async function deletePatient(id) {
  await db.query('DELETE FROM patients WHERE patient_id = ?', [Number(id)]);

  const [[maxRow]] = await db.query('SELECT COALESCE(MAX(patient_id), 0) AS max_id FROM patients');
  const nextId = Math.max(1, Number(maxRow.max_id) + 1);
  await db.query('ALTER TABLE patients AUTO_INCREMENT = ?', [nextId]);

  return { success: true };
}

module.exports = {
  getAllMedicines,
  getAlerts,
  getFefoOrder,
  getUserByLogin,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getAllPatients,
  addPatient,
  updatePatient,
  deletePatient,
};