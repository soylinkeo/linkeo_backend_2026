// src/routes/profileRoutes.js
const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const Profile = require("../models/Profile");

const {
  createProfile,
  updateProfile,
  getMe,
  upsertMe,
  getMyNfcLayout,
  upsertMyNfcLayout,
  getPublicBySlug,
} = require("../controllers/profileController");

const router = express.Router();

/* ============ PUBLICAS ============ */

// público por slug
router.get("/public/:slug", getPublicBySlug);

// (opcional) lista
router.get("/", async (req, res, next) => {
  try {
    const items = await Profile.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

/* ============ PRIVADAS (auth) ============ */

router.get("/me/profile", requireAuth, getMe);
router.put("/me/profile", requireAuth, upsertMe);

router.get("/me/nfc-layout", requireAuth, getMyNfcLayout);
router.put("/me/nfc-layout", requireAuth, upsertMyNfcLayout);

// crear
router.post("/", requireAuth, createProfile);

// update por id
router.patch("/:id", requireAuth, updateProfile);

// (opcional) get por id (si lo usas)
router.get("/:id", async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.id).lean();
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (e) {
    next(e);
  }
});

module.exports = router;