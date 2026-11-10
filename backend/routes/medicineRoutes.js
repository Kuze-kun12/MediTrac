const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/medicineController');

// HTTP GET - Read operations & SQL Joins
router.get('/api/data', getAllMedicines);
router.get('/api/data/:id', getMedicineById);
router.get('/api/fefo', async (req, res) => {
  try {
    const data = await getFefoOrder();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/api/alerts', async (req, res) => {
  try {
    const data = await getAlerts();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/api/joined-category', async (req, res) => {
  try {
    const data = await getMedicinesWithCategory();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/api/missing-batch', async (req, res) => {
  try {
    const data = await getMedicinesWithMissingBatch();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/api/stations-right-join', async (req, res) => {
  try {
    const data = await getStationsWithBatchesRightJoin();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/api/full-outer-join', async (req, res) => {
  try {
    const data = await getMedicineFullOuterJoinSimulated();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HTTP POST - Create operations
router.post('/api/data', async (req, res) => {
  try {
    const result = await addMedicine(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HTTP PUT - Update operations
router.put('/api/data/:id', async (req, res) => {
  try {
    const result = await updateMedicine(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HTTP DELETE - Delete operations
router.delete('/api/data/:id', async (req, res) => {
  try {
    const result = await deleteMedicine(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;