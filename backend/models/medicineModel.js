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