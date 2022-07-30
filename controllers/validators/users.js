const Joi = require("joi");

const validators = {
  signupValidator: Joi.object({
    username: Joi.string().max(20).token().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required(),
    confirm_password: Joi.ref("password"),
  }),
};

module.exports = validators;
