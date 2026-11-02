function ok(res, payload = {}, status = 200) {
  return res.status(status).json({ success: true, ...payload });
}

function bad(res, message = 'Request failed.', status = 400) {
  return res.status(status).json({ success: false, message });
}

module.exports = { ok, bad };
