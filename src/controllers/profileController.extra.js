// controllers/profileController.extra.js
const Profile = require('../models/Profile');
const { updateSchema } = require('../validation/profileValidation');

async function setSimpleLinkByUsername(req, res, next) {
  try {
    const { username } = req.params;
    const { url } = req.body || {};
    if (!url || typeof url !== 'string') {
      res.status(400);
      throw new Error('url is required');
    }

    // valida contra tu updateSchema (permite meta/links/etc.)
    const body = { meta: { flow: 'simple', simpleUrl: url }, links: [{ key: 'web', url, visible: true, order: 0 }] };
    const { value, error } = updateSchema.validate(body, { abortEarly: false });
    if (error) {
      res.status(400);
      throw new Error(error.details.map(d => d.message).join('; '));
    }

    const updated = await Profile.findOneAndUpdate(
      { username },
      { $set: value, $setOnInsert: { username } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json(updated);
  } catch (err) { next(err); }
}

async function setCustomModeByUsername(req, res, next) {
  try {
    const { username } = req.params;
    const body = { meta: { flow: 'custom' } };

    const { value, error } = updateSchema.validate(body, { abortEarly: false });
    if (error) {
      res.status(400);
      throw new Error(error.details.map(d => d.message).join('; '));
    }

    const updated = await Profile.findOneAndUpdate(
      { username },
      { $set: value, $setOnInsert: { username } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json(updated);
  } catch (err) { next(err); }
}

module.exports = { setSimpleLinkByUsername, setCustomModeByUsername };
