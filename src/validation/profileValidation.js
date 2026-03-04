// src/validation/profileValidation.js
const Joi = require("joi");

const linkSchema = Joi.object({
  key: Joi.string().trim().required(),
  url: Joi.string().trim().allow(""),
  visible: Joi.boolean().default(true),
  order: Joi.number().integer().min(0).default(0),
});

const themeSchema = Joi.object({
  title: Joi.string().allow(""),
  description: Joi.string().allow(""),
  align: Joi.string().valid("left", "center", "right").default("center"),
  textColor: Joi.string().allow(""),
  avatarAlign: Joi.string().valid("left", "center", "right").default("center"),

  bgMode: Joi.string().valid("solid", "gradient", "image").default("image"),
  bgColor: Joi.string().allow(""),
  bgColor2: Joi.string().allow(""),
  bgAngle: Joi.number().min(0).max(360).default(180),
  bgImageUrl: Joi.string().allow(""),
  overlayOpacity: Joi.number().min(0).max(1).default(0.45),
  bgPosX: Joi.number().min(0).max(100).default(50),
  bgPosY: Joi.number().min(0).max(100).default(50),
  bgZoom: Joi.number().min(50).max(400).default(100),

  btnVariant: Joi.string().valid("filled", "outline", "glass").default("filled"),
  btnUseBrand: Joi.boolean().default(false),
  btnBg: Joi.string().allow(""),
  btnText: Joi.string().allow(""),
  btnBorder: Joi.string().allow(""),
  btnBorderWidth: Joi.number().min(0).max(12).default(2),
  btnRadius: Joi.number().min(0).max(100).default(18),
  btnPill: Joi.boolean().default(true),
  btnShadow: Joi.boolean().default(true),
  btnAlign: Joi.string().valid("stretch", "center").default("stretch"),
  btnWidth: Joi.number().min(0).max(100).default(85),
  btnContentAlign: Joi.string().valid("left", "center", "right").default("left"),
  btnIconSide: Joi.string().valid("left", "right").default("left"),

  phoneWidth: Joi.number().min(280).max(600).default(390),
  containerPadding: Joi.number().min(0).max(80).default(18),
  heroOffset: Joi.number().min(0).max(200).default(0),
  linksGap: Joi.number().min(0).max(80).default(12),
  fontFamily: Joi.string().allow(""),
  fontSize: Joi.number().min(10).max(40).default(16),

  avatarUrl: Joi.string().allow(""),
  coverUrl: Joi.string().allow(""),
  pdfUrl: Joi.string().allow(""),
  pdfName: Joi.string().allow(""),

  contactFullName: Joi.string().allow(""),
  contactOrg: Joi.string().allow(""),
  contactTitle: Joi.string().allow(""),
  contactPhone: Joi.string().allow(""),
  contactEmail: Joi.string().email().allow(""),
  contactWebsite: Joi.string().allow(""),
  contactStreet: Joi.string().allow(""),
  contactCity: Joi.string().allow(""),
  contactRegion: Joi.string().allow(""),
  contactPostalCode: Joi.string().allow(""),
  contactCountry: Joi.string().allow(""),
  contactNote: Joi.string().allow(""),
}).unknown(true);

const createSchema = Joi.object({
  username: Joi.string().trim().min(2).max(50).required(),
  displayName: Joi.string().trim().allow(""),
  bio: Joi.string().trim().allow(""),
  theme: themeSchema.default({}),
  links: Joi.array().items(linkSchema).default([]),
  meta: Joi.object().unknown(true),
});

const updateSchema = Joi.object({
  displayName: Joi.string().trim().allow(""),
  bio: Joi.string().trim().allow(""),
  theme: themeSchema,
  links: Joi.array().items(linkSchema),
  meta: Joi.object().unknown(true),
}).min(1);

module.exports = { createSchema, updateSchema };