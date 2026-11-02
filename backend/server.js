const express = require('express');
const path = require('path');
const medicineRoutes = require('./routes/medicineRoutes');

const app = express();
const PORT = 3000;
const frontendDir = path.join(__dirname, '..', 'frontend');

// This is the app start file.
// It loads the routes and serves the frontend pages.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(frontendDir));

// This is the request chain:
// app -> routes -> controller -> model -> database
app.use('/', medicineRoutes);

// GET = read page
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(frontendDir, 'dashboard.html'));
});

app.get('/healthworker.html', (req, res) => {
  res.sendFile(path.join(frontendDir, 'healthworker.html'));
});

app.listen(PORT, () => {
  console.log("Server running at http://localhost:${PORT}");
});