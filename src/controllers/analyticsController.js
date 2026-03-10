// src/controllers/analyticsController.js
const Profile = require("../models/Profile");

/* ================================================================
   POST /api/analytics/track
   Body: { slug, type, linkKey }
   Público — lo llama PublicProfile.jsx sin token
================================================================ */
async function track(req, res, next) {
  try {
    const { slug, type, linkKey } = req.body || {};
    if (!slug || !type) return res.json({ ok: true });

    if (type === "profile_view") {
      await Profile.findOneAndUpdate(
        { slug },
        { $inc: { "stats.views": 1 } }
      );
    }

    if (type === "link_click" && linkKey) {
      // linkKey es simple: "whatsapp", "instagram", "custom", "vcard", etc.
      await Profile.findOneAndUpdate(
        { slug },
        { $inc: { [`stats.clicks.${linkKey}`]: 1 } }
      );
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ================================================================
   GET /api/analytics/me
   Privado — devuelve stats del usuario autenticado
================================================================ */
async function getMyStats(req, res, next) {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ user: userId })
      .select("stats")
      .lean();

    if (!profile) return res.json({ views: 0, totalClicks: 0, clicks: {} });

    const clicks = Object.fromEntries(profile.stats?.clicks || []);
    const totalClicks = Object.values(clicks).reduce((a, b) => a + b, 0);

    res.json({
      views: profile.stats?.views || 0,
      totalClicks,
      clicks, // { whatsapp: 5, instagram: 3 }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { track, getMyStats };
