// src/controllers/analyticsController.js
const Profile        = require("../models/Profile");
const AnalyticsEvent = require("../models/AnalyticsEvent");

/* ================================================================
   POST /api/analytics/track
   Body: { slug, type, linkKey }
   Público — sin token
================================================================ */
async function track(req, res, next) {
  try {
    const { slug, type, linkKey = "" } = req.body || {};
    if (!slug || !type) return res.json({ ok: true });

    // Buscar el perfil por slug
    const profile = await Profile.findOne({ slug }).select("_id").lean();
    if (!profile) return res.json({ ok: true });

    // Guardar evento individual (permite filtrar por día/semana/mes)
    await AnalyticsEvent.create({
      profileId: profile._id,
      slug,
      type,
      linkKey: type === "link_click" ? linkKey : "",
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ================================================================
   GET /api/analytics/me?days=30
   Privado — stats del usuario autenticado
================================================================ */
async function getMyStats(req, res, next) {
  try {
    const userId = req.user._id;
    const days   = Math.min(parseInt(req.query.days) || 30, 365);

    const profile = await Profile.findOne({ user: userId }).select("_id").lean();
    if (!profile) return res.json({ views: 0, totalClicks: 0, clicks: {}, daily: [] });

    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await AnalyticsEvent.find({
      profileId: profile._id,
      createdAt: { $gte: since },
    }).select("type linkKey createdAt").lean();

    // Totales
    const views       = events.filter(e => e.type === "profile_view").length;
    const clickEvents = events.filter(e => e.type === "link_click");
    const totalClicks = clickEvents.length;

    // Clicks por plataforma: { whatsapp: 5, instagram: 3 }
    const clicks = {};
    for (const e of clickEvents) {
      const k = e.linkKey || "custom";
      clicks[k] = (clicks[k] || 0) + 1;
    }

    // Visitas por día
    const daily = {};
    for (const e of events.filter(ev => ev.type === "profile_view")) {
      const day = e.createdAt.toISOString().slice(0, 10); // "2026-03-10"
      daily[day] = (daily[day] || 0) + 1;
    }

    res.json({ views, totalClicks, clicks, daily });
  } catch (err) {
    next(err);
  }
}

module.exports = { track, getMyStats };
