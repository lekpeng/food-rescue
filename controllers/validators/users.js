const Joi = require("joi");

const validators = {
  signupValidator: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().max(20).token().required(),
    password: Joi.string().max(20).required(),
    confirm_password: Joi.ref("password"),
    location: Joi.string().required(),
  }),

  loginValidator: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

module.exports = validators;
