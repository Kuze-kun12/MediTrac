const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineAlerts,
  loginUser,
  createMedicine,
  getFefo,
  updateMedicineRecord,
  deleteMedicineRecord,
} = require('../controllers/medicineController');

// GET = read data
router.get('/api/data', getMedicines);
router.get('/api/alerts', getMedicineAlerts);
router.get('/api/fefo', getFefo);

// POST = create data
router.post('/login', loginUser);
router.post('/api/medicines', createMedicine);

// PUT = update data
router.put('/api/medicines/:id', updateMedicineRecord);

// DELETE = delete data
router.delete('/api/medicines/:id', deleteMedicineRecord);

module.exports = router;
