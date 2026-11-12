// Grab the built-in 'path' tool from Node.js so we can locate folders and files easily
const path = require('path');

// Tell Node.js to read our secret settings from the .env file (passwords, ports, host)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Bring in the mysql2 library so our code can speak directly to the MySQL / MariaDB database
const mysql = require('mysql2');

// Create a "pool" (a group of reusable phone lines to the database)
// Instead of making a new connection every time, we borrow one from the pool
const db = mysql.createPool({
  // Where the database lives (127.0.0.1 means "this same computer")
  host: process.env.DB_HOST || '127.0.0.1',

  // The database username to log in with
  user: process.env.DB_USER || 'root',

  // The database password (defaults to 'root' if not set in .env)
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'root',

  // The name of our specific database inside MySQL
  database: process.env.DB_NAME || 'Meditrac',

  // The doorway/port MySQL is listening on (default standard port is 3306)
  port: Number(process.env.DB_PORT) || 3306,

  // If all connections are busy, wait in line instead of crashing
  waitForConnections: true,

  // Maximum number of connections open at the exact same time
  connectionLimit: 10,

  // Unlimited people can wait in line if all connections are busy (0 = no limit)
  queueLimit: 0,
});

// Export the pool with .promise() so we can use modern "async / await" instead of messy callbacks
module.exports = db.promise();

