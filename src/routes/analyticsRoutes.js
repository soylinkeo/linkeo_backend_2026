// src/routes/analyticsRoutes.js
const express    = require("express");
const requireAuth = require("../middlewares/requireAuth");
const { track, getMyStats } = require("../controllers/analyticsController");

const router = express.Router();

router.post("/track", track);
router.get("/me",     requireAuth, getMyStats);

module.exports = router;
