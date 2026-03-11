// src/controllers/analyticsController.js
const Profile          = require("../models/Profile");
const AnalyticsDayStat = require("../models/AnalyticsDayStat");

function today() {
  return new Date().toISOString().slice(0, 10);
}

function mapToObj(m) {
  if (!m) return {};
  if (m instanceof Map) return Object.fromEntries(m);
  if (typeof m === "object") return m;
  return {};
}

/* ================================================================
   POST /api/analytics/track  — público
================================================================ */
async function track(req, res, next) {
  try {
    const { slug, type, linkKey = "", linkName = "" } = req.body || {};
    if (!slug || !type) return res.json({ ok: true });

    const profile = await Profile.findOne({ slug }).select("_id").lean();
    if (!profile) return res.json({ ok: true });

    const date   = today();
    const filter = { profileId: profile._id, date };

    if (type === "profile_view") {
      await AnalyticsDayStat.findOneAndUpdate(
        filter,
        { $inc: { views: 1 }, $setOnInsert: { slug } },
        { upsert: true, new: true }
      );
    }

    if (type === "link_click" && linkKey) {
      await AnalyticsDayStat.findOneAndUpdate(
        filter,
        { $inc: { [`clicks.${linkKey}`]: 1 }, $setOnInsert: { slug } },
        { upsert: true, new: true }
      );
      if (linkName) {
        await AnalyticsDayStat.updateOne(
          filter,
          { $set: { [`clickNames.${linkKey}`]: linkName } }
        );
      }
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ================================================================
   GET /api/analytics/me?days=30  — privado
================================================================ */
async function getMyStats(req, res, next) {
  try {
    const userId = req.user._id;
    const days   = Math.min(parseInt(req.query.days) || 30, 365);

    const profile = await Profile.findOne({ user: userId }).select("_id").lean();
    if (!profile) return res.json({ views: 0, totalClicks: 0, clicks: {}, clickNames: {}, daily: {}, dailyClicks: {} });

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    const sinceStr = since.toISOString().slice(0, 10);

    const docs = await AnalyticsDayStat.find({
      profileId: profile._id,
      date: { $gte: sinceStr },
    }).lean();

    let views       = 0;
    let totalClicks = 0;
    const clicks      = {};
    const daily       = {};
    const clickNames  = {};
    const dailyClicks = {};

    for (const doc of docs) {
      // Visitas
      views += doc.views || 0;
      daily[doc.date] = (daily[doc.date] || 0) + (doc.views || 0);

      // Clicks totales
      const docClicks = mapToObj(doc.clicks);
      for (const [k, v] of Object.entries(docClicks)) {
        clicks[k]    = (clicks[k] || 0) + Number(v);
        totalClicks += Number(v);
      }

      // Clicks por día
      if (Object.keys(docClicks).length > 0) {
        dailyClicks[doc.date] = docClicks;
      }

      // Nombres de enlaces
      const docNames = mapToObj(doc.clickNames);
      for (const [k, v] of Object.entries(docNames)) {
        if (!clickNames[k]) clickNames[k] = v;
      }
    }

    res.json({ views, totalClicks, clicks, clickNames, daily, dailyClicks });
  } catch (err) {
    next(err);
  }
}

module.exports = { track, getMyStats };
