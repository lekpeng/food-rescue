const Joi = require("joi");

const validators = {
  signupValidator: Joi.object({
    email: Joi.string().email().required().label("Email"),
    username: Joi.string().max(20).token().required().label("Username"),
    password: Joi.string().max(20).required().label("Password"),
    confirm_password: Joi.ref("password"),
    location: Joi.string().required().label("Location"),
  }),

  loginValidator: Joi.object({
    username: Joi.string().required().label("Username"),
    password: Joi.string().required().label("Password"),
  }),
};

module.exports = validators;
