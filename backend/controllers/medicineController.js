const {
  getAllMedicines,
  getAlerts,
  getFefoOrder,
  getAllPatients,
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

module.exports = {
  getMedicines,
  getMedicineAlerts,
  getFefo,
  getPatients,
  loginUser,
  
};
