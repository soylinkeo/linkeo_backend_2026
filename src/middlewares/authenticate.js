// middlewares/authenticate.js
const { verifyAccess } = require('../utils/jwt');

function authenticateBearer(req, res, next) {
  const hdr = req.headers.authorization || '';
  const [, token] = hdr.split(' ');
  if (!token) {
    res.status(401);
    return next(new Error('Missing Authorization header (Bearer token).'));
  }
  try {
    const payload = verifyAccess(token);
    req.user = payload; // { sub, username, roles, ... }
    next();
  } catch (err) {
    res.status(401);
    next(new Error('Invalid or expired token.'));
  }
}

module.exports = { authenticateBearer };
