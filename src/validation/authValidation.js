// validation/authValidation.js
const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  user: Joi.string().required(),       // username o email
  pass: Joi.string().min(6).required()
});

module.exports = { registerSchema, loginSchema };
