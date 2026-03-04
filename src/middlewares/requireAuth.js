// src/middlewares/requireAuth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

module.exports = async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      res.status(401);
      throw new Error("No autorizado");
    }

    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(payload.sub)
      .select("_id username email roles profile")
      .lean();

    if (!user) {
      res.status(401);
      throw new Error("Token inválido");
    }

    req.user = user; // { _id, username, email, roles, profile }
    next();
  } catch (err) {
    next(err);
  }
};