// =============================================================================
// authController.js - Login Brain / Controller
// =============================================================================
// Purpose: Handles what happens when someone clicks the "Sign In" button!
// =============================================================================

// Grab the database query function that looks up users by their username and password
const { getUserByLogin } = require('../models/authModel');

// Grab our helper tools for sending back happy (ok) or sad (bad) JSON responses
const { ok, bad } = require('../utils/response');

// Main function that runs when someone attempts to log in
async function loginUser(req, res) {
  // Step 1: Open the box (req.body) sent by the browser and take out username and password
  const { username, password } = req.body;

  // Step 2: Did they forget to type something? If either box is blank, stop and complain!
  if (!username || !password) {
    // 400 Bad Request: "Hey, you didn't give me what I asked for!"
    return bad(res, 'Please enter username and password.', 400);
  }

  try {
    // Step 3: Ask the database model: "Does anyone exist with this username and password?"
    const results = await getUserByLogin(username, password);

    // Step 4: If results array is empty (length === 0), nobody matched!
    if (results.length === 0) {
      // 401 Unauthorized: "Wrong username or password! You shall not pass!"
      return bad(res, 'Incorrect password or username.', 401);
    }

    // Step 5: Found the user! Grab their data (the first item in the results list)
    const user = results[0];

    // Step 6: Decide which page to send them to based on their official role!
    // Default destination is the health worker page
    let redirect = '/healthworker.html';

    // If their role is 'admin', send them to the main admin dashboard!
    if (user.role_name === 'admin') {
      redirect = '/dashboard.html';
    // If their role is 'pharmacist', send them to the pharmacy dispensing page!
    } else if (user.role_name === 'pharmacist') {
      redirect = '/pharmacist.html';
    }

    // Step 7: Send a happy 200 OK letter back to the browser with their destination URL
    return ok(res, {
      redirect,
      role: user.role_name,
      message: 'Login successful.',
    });
  } catch (error) {
    // If the database crashed or something blew up, log it to the console
    console.error('Login error:', error);
    // 500 Internal Server Error: "Oops, something broke inside the server!"
    return bad(res, 'Database error during login.', 500);
  }
}

// Export this function so our authRoutes can use it
module.exports = {
  loginUser,
};

