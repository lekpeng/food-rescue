const Joi = require("joi");

const validators = {
  createListingValidator: Joi.object({
    listing_name: Joi.string().min(6).max(30).required(),
    description: Joi.string().max(200),
    pick_up_days_and_times: Joi.string().max(30).required(),
    category: Joi.string().required(),
    expiry_date: Joi.date().required(),
  }),
};

module.exports = validators;
