// src/routes/authRoutes.js
const express = require("express");
const auth = require("../controllers/authController");
const requireAuth = require("../middlewares/requireAuth");
const User = require("../models/User");

const router = express.Router();

/* ====== MIDDLEWARE ADMIN ====== */
function requireAdmin(req, res, next) {
  if (!req.user?.roles?.includes("admin")) {
    res.status(403);
    return next(new Error("No autorizado — se requiere rol admin"));
  }
  next();
}

/* ====== AUTH PÚBLICA ====== */
router.post("/register", auth.register);
router.post("/login",    auth.login);
router.post("/refresh",  auth.refresh);
router.post("/logout",   auth.logout);

/* ====== ADMIN — gestión de usuarios ====== */

// GET /api/auth/admin/users
// Lista todos los usuarios con su status
router.get("/admin/users", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.query; // ?status=pending filtra por status
    const filter = status ? { status } : {};
    const users = await User.find(filter)
      .select("username email status roles createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/admin/users/:id
// Cambia el status de un usuario: "active" | "pending" | "blocked"
router.patch("/admin/users/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["active", "pending", "blocked"].includes(status)) {
      res.status(400);
      throw new Error('status debe ser "active", "pending" o "blocked"');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("username email status roles");

    if (!user) {
      res.status(404);
      throw new Error("Usuario no encontrado");
    }

    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/admin/users/:id
// Elimina un usuario
router.delete("/admin/users/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("Usuario no encontrado");
    }
    res.json({ ok: true, deleted: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;