const { getUserByLogin } = require('../models/authModel');
const { ok, bad } = require('../utils/response');


async function loginUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return bad(res, 'Please enter username and password.', 400);
  }


  try {
    const results = await getUserByLogin(username, password);

    if (results.length === 0) {
      return bad(res, 'Incorrect password or username.', 401);
    }

    const user = results[0];
    let redirect = '/healthworker.html';

    if (user.role_name === 'admin') {
      redirect = '/dashboard.html';
    } else if (user.role_name === 'pharmacist') {
      redirect = '/pharmacist.html';
    }

    return ok(res, {
      redirect,
      role: user.role_name,
      message: 'Login successful.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return bad(res, 'Database error during login.', 500);
  }
}

module.exports = {
  loginUser,
};
