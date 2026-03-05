// src/models/Profile.js
const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    url: { type: String, default: "" },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

// ✅ NUEVO: schema para enlaces personalizados
const CustomLinkSchema = new mongoose.Schema(
  {
    id:      { type: String, required: true },
    name:    { type: String, default: "" },
    url:     { type: String, default: "" },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);

const ThemeSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    align: { type: String, enum: ["left", "center", "right"], default: "center" },
    textColor: { type: String, default: "#111827" },
    avatarAlign: { type: String, enum: ["left", "center", "right"], default: "center" },

    bgMode: { type: String, enum: ["solid", "gradient", "image"], default: "image" },
    bgColor: { type: String, default: "#0f172a" },
    bgColor2: { type: String, default: "#1e3a8a" },
    bgAngle: { type: Number, default: 180 },
    bgImageUrl: { type: String, default: "" },
    overlayOpacity: { type: Number, min: 0, max: 1, default: 0.45 },
    bgPosX: { type: Number, default: 50 },
    bgPosY: { type: Number, default: 50 },
    bgZoom: { type: Number, default: 100 },

    btnVariant: { type: String, enum: ["filled", "outline", "glass"], default: "filled" },
    btnUseBrand: { type: Boolean, default: false },
    btnBg: { type: String, default: "#0f172a" },
    btnText: { type: String, default: "#ffffff" },
    btnBorder: { type: String, default: "#ffffff" },
    btnBorderWidth: { type: Number, default: 2 },
    btnRadius: { type: Number, default: 18 },
    btnPill: { type: Boolean, default: true },
    btnShadow: { type: Boolean, default: true },
    btnAlign: { type: String, enum: ["stretch", "center"], default: "stretch" },
    btnWidth: { type: Number, default: 85 },
    btnContentAlign: { type: String, enum: ["left", "center", "right"], default: "left" },
    btnIconSide: { type: String, enum: ["left", "right"], default: "left" },

    phoneWidth: { type: Number, default: 390 },
    containerPadding: { type: Number, default: 18 },
    heroOffset: { type: Number, default: 0 },
    linksGap: { type: Number, default: 12 },
    fontFamily: { type: String, default: "System" },
    fontSize: { type: Number, default: 16 },

    avatarUrl: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
    pdfName: { type: String, default: "" },

    contactFullName: { type: String, default: "" },
    contactOrg: { type: String, default: "" },
    contactTitle: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactWebsite: { type: String, default: "" },
    contactStreet: { type: String, default: "" },
    contactCity: { type: String, default: "" },
    contactRegion: { type: String, default: "" },
    contactPostalCode: { type: String, default: "" },
    contactCountry: { type: String, default: "" },
    contactNote: { type: String, default: "" },
  },
  { _id: false }
);

const ProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    username: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, default: "" },
    bio: { type: String, default: "" },
    theme: { type: ThemeSchema, default: () => ({}) },
    links: { type: [LinkSchema], default: [] },
    // ✅ NUEVO: enlaces personalizados del usuario
    customLinks: { type: [CustomLinkSchema], default: [] },
    meta: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);
