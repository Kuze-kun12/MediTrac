const {
  getAllMedicines,
  getAlerts,
  getFefoOrder,
  getAllPatients,
  addMedicine,
  addPatient,
  getUserByLogin,
} = require('../models/medicineModel');
const { ok, bad } = require('../utils/response');

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
  const required = ['generic_name', 'strength', 'dosage_form', 'unit', 'barangay', 'reorder_level', 'batch_no', 'expiry_date', 'qty_on_hand'];

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
    return bad(res, 'Could not add medicine.');
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
module.exports = {
  getMedicines,
  getMedicineAlerts,
  getFefo,
  getPatients,
  loginUser,
  createMedicine,
  createPatient,
};
