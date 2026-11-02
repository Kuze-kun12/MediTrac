const {
  getAllMedicines,
  getAlerts,
  getFefoOrder,
  getAllPatients,
  addMedicine,
  addPatient,
  getUserByLogin,
  getMedicinesWithCategory,
  getAllHealthStations,
  getAvailableMedicineBatches,
  getDispensingLog,
  addDispensingRecord,
  updateMedicine,
  deleteMedicine,
} = require('../models/medicineModel');
const { ok, bad } = require('../utils/response');

function normalizeMedicinePayload(body = {}) {
  return {
    generic_name: body.generic_name ?? body.medName ?? body.name ?? '',
    strength: body.strength ?? 'N/A',
    dosage_form: body.dosage_form ?? body.dosageForm ?? 'Tablet',
    unit: body.unit ?? 'pcs',
    barangay: body.barangay ?? body.station_name ?? body.stationName ?? 'Central Health Center',
    reorder_level: body.reorder_level ?? body.reorderLevel ?? 0,
    batch_no: body.batch_no ?? body.batchNo ?? '',
    expiry_date: body.expiry_date ?? body.expiry ?? '',
    qty_on_hand: body.qty_on_hand ?? body.qtyOnHand ?? 0,
    category_name: body.category_name ?? body.category ?? 'General',
    supplier_name: body.supplier_name ?? body.supplier ?? 'MedPharma Global',
    unit_cost: body.unit_cost ?? body.unitCost ?? 0,
  };
}

function normalizePatientPayload(body = {}) {
  return {
    full_name: body.full_name ?? body.fullName ?? '',
    birthdate: body.birthdate ?? '',
    purok: body.purok ?? '',
    contact: body.contact ?? '',
  };
}

function normalizeDispensingPayload(body = {}) {
  return {
    station_id: body.station_id ?? body.stationId ?? body.barangay_id ?? '',
    batch_id: body.batch_id ?? body.batchId ?? '',
    qty: body.qty ?? body.quantity ?? 1,
    patient_name: body.patient_name ?? body.patientName ?? body.dispensed_to ?? '',
    user_id: body.user_id ?? body.userId ?? '',
  };
}

// GET = read list of medicines
async function getMedicines(req, res) {
  try {
    const rows = await getAllMedicines();
    return ok(res, { items: rows });
  } catch (error) {
    console.error('Get medicines error:', error);
    return bad(res, 'Could not load medicines.');
  }
}

// GET = read alerts
async function getMedicineAlerts(req, res) {
  try {
    const rows = await getAlerts();
    return ok(res, { alerts: rows });
  } catch (error) {
    console.error('Get alerts error:', error);
    return bad(res, 'Could not load alerts.');
  }
}

// GET = read FEFO order
async function getFefo(req, res) {
  try {
    const rows = await getFefoOrder();
    return ok(res, { fefo: rows });
  } catch (error) {
    console.error('FEFO query error:', error);
    return bad(res, 'Could not load FEFO order.');
  }
}

// GET = read list of patients
async function getPatients(req, res) {
  try {
    const rows = await getAllPatients();
    return ok(res, { items: rows });
  } catch (error) {
    console.error('Get patients error:', error);
    return bad(res, 'Could not load patients.');
  }
}

// GET = read list of health stations
async function getHealthStations(req, res) {
  try {
    const rows = await getAllHealthStations();
    return ok(res, { items: rows });
  } catch (error) {
    console.error('Get health stations error:', error);
    return bad(res, 'Could not load barangay health centers.');
  }
}

// GET = read dispensing options
async function getDispensingOptions(req, res) {
  try {
    const [stations, batches] = await Promise.all([
      getAllHealthStations(),
      getAvailableMedicineBatches(),
    ]);

    return ok(res, { stations, batches });
  } catch (error) {
    console.error('Get dispensing options error:', error);
    return bad(res, 'Could not load dispensing options.');
  }
}

// GET = read dispensing records
async function getDispensingRecords(req, res) {
  try {
    const rows = await getDispensingLog();
    return ok(res, { items: rows });
  } catch (error) {
    console.error('Get dispensing log error:', error);
    return bad(res, 'Could not load dispensing record log.');
  }
}

// POST = login user
async function loginUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return bad(res, 'Please enter username and password.', 400);
  }

  try {
    const results = await getUserByLogin(username, password);

    if (results.length === 0) {
      return bad(res, 'Incorrect password or username.', 401);
    }

    const user = results[0];
    let redirect = '/healthworker.html';

    if (user.role_name === 'admin') {
      redirect = '/dashboard.html';
    } else if (user.role_name === 'pharmacist') {
      redirect = '/pharmacist.html';
    }

    return ok(res, {
      redirect,
      role: user.role_name,
      message: 'Login ok',
    });
  } catch (error) {
    console.error('Login error:', error);
    return bad(res, 'Database error.');
  }
}

// POST = add new medicine
async function createMedicine(req, res) {
  const payload = normalizeMedicinePayload(req.body);
  const required = ['generic_name', 'batch_no', 'expiry_date', 'qty_on_hand'];

  const missing = required.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === '' || (typeof value === 'number' && Number.isNaN(value));
  });

  if (missing.length > 0) {
    return bad(res, 'Please fill all required medicine fields.', 400);
  }

  try {
    await addMedicine(payload);
    return ok(res, { message: 'Medicine added successfully.' }, 201);
  } catch (error) {
    console.error('Create medicine error:', error);
    return bad(res, error.message || 'Could not add medicine.');
  }
}

// POST = add new patient
async function createPatient(req, res) {
  const payload = normalizePatientPayload(req.body);
  const required = ['full_name', 'birthdate', 'purok'];
  const missing = required.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    return bad(res, 'Please fill all required patient fields.', 400);
  }

  try {
    await addPatient(payload);
    return ok(res, { message: 'Patient added successfully.' }, 201);
  } catch (error) {
    console.error('Create patient error:', error);
    return bad(res, error.message || 'Could not add patient.');
  }
}

// POST = save dispensing record
async function createDispensingRecord(req, res) {
  const payload = normalizeDispensingPayload(req.body);
  const required = ['station_id', 'batch_id', 'qty'];
  const missing = required.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === '' || Number(value) <= 0;
  });

  if (missing.length > 0) {
    return bad(res, 'Please choose a barangay health center, medicine batch, and quantity.', 400);
  }

  try {
    const result = await addDispensingRecord(payload);
    return ok(res, { message: 'Dispensing record saved.', item: result }, 201);
  } catch (error) {
    console.error('Create dispensing error:', error);
    return bad(res, error.message || 'Could not save dispensing record.');
  }
}

async function getJoinedMedicines(req, res) {
  try {
    const rows = await getMedicinesWithCategory();
    return ok(res, { items: rows });
  } catch (error) {
    console.error('Get joined medicines error:', error);
    return bad(res, 'Could not load joined medicine data.');
  }
}

// PUT = update medicine
async function updateMedicineRecord(req, res) {
  const medicineId = Number(req.params.id);
  const payload = normalizeMedicinePayload(req.body);

  if (!medicineId || Number.isNaN(medicineId)) {
    return bad(res, 'Medicine ID is missing.', 400);
  }

  const required = ['generic_name', 'strength', 'dosage_form', 'unit', 'barangay', 'reorder_level', 'batch_no', 'expiry_date', 'qty_on_hand'];
  const missing = required.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === '' || (typeof value === 'number' && Number.isNaN(value));
  });

  if (missing.length > 0) {
    return bad(res, 'Please fill all required medicine fields.', 400);
  }

  try {
    await updateMedicine(medicineId, payload);
    return ok(res, { message: 'Medicine updated successfully.' });
  } catch (error) {
    console.error('Update medicine error:', error);
    return bad(res, error.message || 'Could not update medicine.');
  }
}

// DELETE = remove medicine
async function deleteMedicineRecord(req, res) {
  const medicineId = Number(req.params.id);

  if (!medicineId || Number.isNaN(medicineId)) {
    return bad(res, 'Medicine ID is missing.', 400);
  }

  try {
    await deleteMedicine(medicineId);
    return ok(res, { message: 'Medicine removed successfully.' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    return bad(res, error.message || 'Could not remove medicine.');
  }
}

module.exports = {
  getMedicines,
  getMedicineAlerts,
  getFefo,
  getPatients,
  loginUser,
  createMedicine,
  createPatient,
  getJoinedMedicines,
  getHealthStations,
  getDispensingOptions,
  getDispensingRecords,
  createDispensingRecord,
  updateMedicineRecord,
  deleteMedicineRecord,
};
