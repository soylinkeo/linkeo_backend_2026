// src/models/AnalyticsEvent.js
const mongoose = require("mongoose");

const AnalyticsEventSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    slug:      { type: String, required: true, index: true },
    type:      { type: String, enum: ["profile_view", "link_click"], required: true },
    linkKey:   { type: String, default: "" }, // "whatsapp", "instagram", "custom", "vcard", etc.
  },
  { timestamps: true } // createdAt nos da la fecha exacta
);

// Índices para queries rápidas por perfil + fecha
AnalyticsEventSchema.index({ profileId: 1, createdAt: -1 });
AnalyticsEventSchema.index({ profileId: 1, type: 1, createdAt: -1 });
AnalyticsEventSchema.index({ profileId: 1, linkKey: 1, createdAt: -1 });

module.exports = mongoose.model("AnalyticsEvent", AnalyticsEventSchema);
