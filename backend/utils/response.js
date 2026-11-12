// Helper function for sending a HAPPY response (HTTP 200 = Success, or 201 = Created)
// res: the response letter we send back to the user's browser
// payload: whatever data we want to give them (like a list of medicines)
// status: the official HTTP status number (default is 200 OK)
function ok(res, payload = {}, status = 200) {
  // Always include success: true so the frontend knows everything went great!
  return res.status(status).json({ success: true, ...payload });
}

// Helper function for sending a SAD response (HTTP 400 = Bad Request, 404 = Not Found, 500 = Error)
// res: the response letter back to the browser
// message: a short text explaining what went wrong (e.g. "Wrong password")
// status: the error status code (default is 400 Bad Request)
function bad(res, message = 'Request failed.', status = 400) {
  // Always include success: false and the error message
  return res.status(status).json({ success: false, message });
}

// Make these two helper functions available to all our controllers
module.exports = { ok, bad };
