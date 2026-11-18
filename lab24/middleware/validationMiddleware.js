const Joi = require('joi');

const userCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'минимум 2 символа',
    'any.required': 'поле name обязательно'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'неверный формат',
    'any.required': 'поле email обязательно'
  }),
  group_name: Joi.string().pattern(/^(?:ББМО|BBMO)-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'формат ББМО-XX-XX',
    'any.required': 'поле group_name обязательно'
  }),
  age: Joi.number().integer().min(16).max(100).messages({
    'number.min': 'возраст от 16',
    'number.max': 'возраст до 100'
  }),
  course: Joi.number().integer().min(1).max(4),
  password: Joi.string().min(6),
  role: Joi.string().valid('user', 'admin', 'moderator')
});

const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).messages({
    'number.min': 'должно быть больше 0'
  }),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string().valid('name', '-name', 'age', '-age', '-created_at'),
  group_name: Joi.string(),
  course: Joi.number().integer(),
  age_min: Joi.number().integer(),
  age_max: Joi.number().integer(),
  search: Joi.string(),
  q: Joi.string()
});

function validateBody(schema) {
  return async (ctx, next) => {
    const { error, value } = schema.validate(ctx.request.body, { abortEarly: false });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message
      }));
      ctx.status = 400;
      ctx.body = { error: 'Validation failed', details };
      return;
    }
    ctx.request.body = value;
    await next();
  };
}

function validateQuery(schema) {
  return async (ctx, next) => {
    const { error, value } = schema.validate(ctx.query, { abortEarly: false });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message
      }));
      ctx.status = 400;
      ctx.body = { error: 'Validation failed', details };
      return;
    }
    ctx.query = value;
    await next();
  };
}

module.exports = {
  userCreateSchema,
  userQuerySchema,
  validateBody,
  validateQuery
};
