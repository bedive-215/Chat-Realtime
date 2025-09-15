import Joi from 'joi';

const commonMessages = {
  'string.empty': '{#label} cannot be empty',
  'any.required': '{#label} is required',
  'string.min': '{#label} should have a minimum length of {#limit}',
  'string.max': '{#label} should have a maximum length of {#limit}',
  'string.pattern.base': '{#label} has invalid format'
};

export const registationValidate = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  phone_number: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(255).required(),
  confirm_password: Joi.string().valid(Joi.ref('password')).required()
}).with('password', 'confirm_password').messages({
  ...commonMessages,
  'any.only': '{#label} does not match with password or accepted values'
});

export const signInValidate = Joi.object({
  login_name: Joi.string().min(3).max(30).required(),
  password: Joi.string().pattern(/^[a-zA-Z0-9]+$/).min(6).max(255).required()
}).messages({
  ...commonMessages
});
