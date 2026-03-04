// validation/nfcLayoutValidation.js
const Joi = require('joi');

const cardSchema = Joi.object({
  width: Joi.number().min(100).required(),
  height: Joi.number().min(100).required(),
  radius: Joi.number().min(0).default(0),
  bgColor: Joi.string().allow(''),
  bgImageDataUrl: Joi.string().allow(''), // puedes migrar a URL luego
  showGrid: Joi.boolean().default(true),
  exportDPI: Joi.number().valid(150, 300, 450, 600).default(300),
  safeMm: Joi.number().min(0).default(3),
}).required();

const elementSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().valid('text','image','icon').required(),

  x: Joi.number().required(),
  y: Joi.number().required(),
  w: Joi.number().min(1).required(),
  h: Joi.number().min(1).required(),

  rotate: Joi.number().default(0),
  radius: Joi.number().min(0).default(0),
  bg: Joi.string().allow(''),

  // text
  text: Joi.string().allow(''),
  color: Joi.string().allow(''),
  align: Joi.string().valid('left','center','right').default('left'),
  fontFamily: Joi.string().allow(''),
  fontSize: Joi.number().min(1),
  weight: Joi.number().min(100).max(1000),

  // image
  src: Joi.string().allow(''),
  objectFit: Joi.string().valid('cover','contain','fill'),

  // icon
  iconName: Joi.string().allow(''),
}).unknown(true); // por si añades props nuevas

const nfcLayoutSchema = Joi.object({
  cards: Joi.object({
    front: cardSchema,
    back:  cardSchema,
  }).required(),
  elementsBySide: Joi.object({
    front: Joi.array().items(elementSchema).required(),
    back:  Joi.array().items(elementSchema).required(),
  }).required()
});

module.exports = { nfcLayoutSchema };
