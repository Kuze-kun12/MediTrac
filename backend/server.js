// =============================================================================
// server.js - The Main Engine / Entry Door of our Application
// =============================================================================
// Purpose: Starts the web server, connects all routes, and serves HTML pages!
// =============================================================================

// Load environment variables (like PORT) from the secret .env file
require('dotenv').config();

// Bring in the Express web framework
const express = require('express');

// Bring in Node's path tool to find folders easily
const path = require('path');

// Import our route maps (Layered MVC Architecture)
const authRoutes         = require('./routes/authRoutes');         // Handles /login
const medicineRoutes     = require('./routes/medicineRoutes');     // Handles /api/data, joins, alerts
const patientRoutes      = require('./routes/patientRoutes');      // Handles /api/patients
const stationRoutes      = require('./routes/stationRoutes');      // Handles /api/health-stations
const dispensingRoutes   = require('./routes/dispensingRoutes');   // Handles /api/dispensing-records
const announcementRoutes = require('./routes/announcementRoutes'); // Handles /api/announcements

// Create the Express app (our main web server)
const app = express();

// Choose which port to listen on (use PORT from .env or default to 3000)
const PORT = process.env.PORT || 3000;

// Figure out the exact folder path to the frontend files (HTML, CSS, JS)
const frontendDir = path.join(__dirname, '..', 'frontend');

// Middleware 1: Understand incoming data that is formatted as JSON
app.use(express.json());

// Middleware 2: Understand incoming data submitted from regular HTML forms
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------------------------------------
// Frontend Page Routes (Serves the HTML pages to the user's browser)
// -----------------------------------------------------------------------------

// When user visits "http://localhost:3000/", show the login page (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// When user visits "/dashboard.html", show the Admin Dashboard page
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(frontendDir, 'dashboard.html'));
});

// When user visits "/healthworker.html", show the Barangay Health Worker page
app.get('/healthworker.html', (req, res) => {
  res.sendFile(path.join(frontendDir, 'healthworker.html'));
});

// When user visits "/pharmacist.html", show the Pharmacist dispensing page
app.get('/pharmacist.html', (req, res) => {
  res.sendFile(path.join(frontendDir, 'pharmacist.html'));
});

// Serve frontend static assets (like style.css, images, etc.) automatically
app.use(express.static(frontendDir));

// -----------------------------------------------------------------------------
// Mount Modular API Routes
// -----------------------------------------------------------------------------
// Plug each router into our app so the backend listens to those URLs
app.use('/', authRoutes);
app.use('/', medicineRoutes);
app.use('/', patientRoutes);
app.use('/', stationRoutes);
app.use('/', dispensingRoutes);
app.use('/', announcementRoutes);

// Start listening for web visitors on the chosen port!
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

