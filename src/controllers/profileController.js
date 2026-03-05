// src/controllers/profileController.js
const Profile = require("../models/Profile");
const { createSchema, updateSchema } = require("../validation/profileValidation");
const { nfcLayoutSchema } = require("../validation/nfcLayoutValidation");

/* ====== SLUG HELPERS ====== */
function slugifySimple(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function ensureUniqueSlug(base, excludeId) {
  let slug = base || "usuario";
  let n = 1;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };

    const exists = await Profile.exists(query);
    if (!exists) return slug;

    n += 1;
    slug = `${base}-${n}`;
  }
}

/* ================== ME ================== */

// GET /api/profiles/me/profile
async function getMe(req, res, next) {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Profile no encontrado");
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

// PUT /api/profiles/me/profile
async function upsertMe(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400);
      throw new Error(error.details.map((d) => d.message).join("; "));
    }

    delete value.user;

    let usernamePatch = {};
    if (typeof req.body.username === "string" && req.body.username.trim()) {
      usernamePatch.username = req.body.username.trim();
    }

    const current = await Profile.findOne({ user: req.user._id }).select("_id username slug").lean();

    const finalUsername = (usernamePatch.username || current?.username || "").trim();
    const base = slugifySimple(finalUsername || "usuario");
    const slug = await ensureUniqueSlug(base, current?._id);

    // Construir patch explícitamente para garantizar que customLinks se persiste
    const patch = { ...value, ...usernamePatch, slug };

    // Si viene customLinks vacío array, forzar con $set explícito
    // (algunos drivers Mongoose ignoran arrays vacíos con spread)
    const updateOp = { $set: patch };

    const updated = await Profile.findOneAndUpdate(
      { user: req.user._id },
      updateOp,
      { new: true, upsert: true, runValidators: false, setDefaultsOnInsert: true }
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/* ================== CRUD ================== */

// POST /api/profiles
async function createProfile(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400);
      throw new Error(error.details.map((d) => d.message).join("; "));
    }

    const existsForUser = await Profile.findOne({ user: req.user._id });
    if (existsForUser) {
      res.status(409);
      throw new Error("Este usuario ya tiene profile");
    }

    const base = slugifySimple(value.username);
    const slug = await ensureUniqueSlug(base);

    const profile = await Profile.create({ ...value, user: req.user._id, slug });
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/profiles/:id
async function updateProfile(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400);
      throw new Error(error.details.map((d) => d.message).join("; "));
    }

    let patch = { ...value };
    if (typeof req.body.username === "string" && req.body.username.trim()) {
      patch.username = req.body.username.trim();
    }

    const current = await Profile.findOne({ _id: req.params.id, user: req.user._id })
      .select("_id username slug")
      .lean();

    if (!current) {
      res.status(404);
      throw new Error("Profile no encontrado");
    }

    const finalUsername = (patch.username || current.username || "").trim();
    const base = slugifySimple(finalUsername || "usuario");
    patch.slug = await ensureUniqueSlug(base, current._id);

    const updated = await Profile.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: patch },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/* ================== PUBLIC ================== */

// GET /api/profiles/public/:slug
async function getPublicBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    // ✅ agregamos customLinks al .select() para que llegue al frontend público
    const profile = await Profile.findOne({ slug })
      .select("slug username displayName bio theme links customLinks meta")
      .lean();

    if (!profile) {
      res.status(404);
      throw new Error("Profile not found");
    }

    res.json({
      slug:        profile.slug,
      username:    profile.username,
      displayName: profile.displayName,
      bio:         profile.bio,
      theme:       profile.theme || {},
      links:       profile.links || [],
      customLinks: profile.customLinks || [],   // ✅ NUEVO
      nfcLayout:   profile.meta?.nfcDesignerDualV1 ?? null,
    });
  } catch (err) {
    next(err);
  }
}

/* ================== NFC LAYOUT ================== */

// GET /api/profiles/me/nfc-layout
async function getMyNfcLayout(req, res, next) {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).lean();
    if (!profile) {
      res.status(404);
      throw new Error("Profile no encontrado");
    }

    res.json({ ok: true, data: profile.meta?.nfcDesignerDualV1 ?? null });
  } catch (err) {
    next(err);
  }
}

// PUT /api/profiles/me/nfc-layout
async function upsertMyNfcLayout(req, res, next) {
  try {
    const { value, error } = nfcLayoutSchema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400);
      throw new Error(error.details.map((d) => d.message).join("; "));
    }

    const updated = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { "meta.nfcDesignerDualV1": value } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      res.status(404);
      throw new Error("Profile no encontrado");
    }

    res.json({ ok: true, data: updated.meta?.nfcDesignerDualV1 ?? value });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
  upsertMe,
  createProfile,
  updateProfile,
  getPublicBySlug,
  getMyNfcLayout,
  upsertMyNfcLayout,
};
