// src/routes/authRoutes.js
const express = require("express");
const auth = require("../controllers/authController");

const router = express.Router();

["register", "login"].forEach((fn) => {
  if (typeof auth[fn] !== "function") {
    throw new Error(`authController.${fn} no está exportado como función`);
  }
});

router.post("/register", auth.register);
router.post("/login", auth.login);

router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);

module.exports = router;