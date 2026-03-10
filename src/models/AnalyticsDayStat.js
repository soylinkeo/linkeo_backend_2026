// src/models/AnalyticsDayStat.js
const mongoose = require("mongoose");

const AnalyticsDayStatSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
    slug:      { type: String, required: true },
    date:      { type: String, required: true }, // "2026-03-10"
    views:     { type: Number, default: 0 },
    clicks:    { type: Map, of: Number, default: () => ({}) }, // { whatsapp: 4, phone: 1 }
  },
  { timestamps: true }
);

// Un solo documento por perfil por día
AnalyticsDayStatSchema.index({ profileId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("AnalyticsDayStat", AnalyticsDayStatSchema);
