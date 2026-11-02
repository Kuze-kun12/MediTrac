const {
  getAllMedicines,
  getAlerts,
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


module.exports = {
  getMedicines,
  getMedicineAlerts,
};

