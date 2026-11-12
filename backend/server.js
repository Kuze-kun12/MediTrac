// Load environment variables (like PORT) from the secret .env file
require('dotenv').config();

// Bring in the Express web framework
const express = require('express');

// Bring in Node's path tool to find folders easily
const path = require('path');

// Import our route maps (Layered MVC Architecture)
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const patientRoutes = require('./routes/patientRoutes');
const stationRoutes = require('./routes/stationRoutes');
const dispensingRoutes = require('./routes/dispensingRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

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

// Serve frontend static assets (like style.css, images, etc.) automatically
app.use(express.static(frontendDir));

// Mount modular API routes
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
