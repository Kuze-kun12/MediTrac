// =============================================================================
// server.js - Express Application Entry Point
// =============================================================================
require('dotenv').config();
const express = require('express');
const path = require('path');

// Import modular routes (Layered MVC Architecture)
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const patientRoutes = require('./routes/patientRoutes');
const stationRoutes = require('./routes/stationRoutes');
const dispensingRoutes     = require('./routes/dispensingRoutes');
const announcementRoutes   = require('./routes/announcementRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const frontendDir = path.join(__dirname, '..', 'frontend');

// Middleware for parsing JSON and form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend page routes — declared BEFORE API routes so GET / always
// serves index.html without conflicting with authRoutes
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(frontendDir, 'dashboard.html'));
});

app.get('/healthworker.html', (req, res) => {
  res.sendFile(path.join(frontendDir, 'healthworker.html'));
});

app.get('/pharmacist.html', (req, res) => {
  res.sendFile(path.join(frontendDir, 'pharmacist.html'));
});

// Serve frontend static assets (HTML, CSS, JS)
app.use(express.static(frontendDir));

// Mount modular API routes
app.use('/', authRoutes);
app.use('/', medicineRoutes);
app.use('/', patientRoutes);
app.use('/', stationRoutes);
app.use('/', dispensingRoutes);
app.use('/', announcementRoutes);

// Start Express server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
