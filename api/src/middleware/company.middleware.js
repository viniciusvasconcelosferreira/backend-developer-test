const Validator = require('validatorjs');

const createCompanyValidation = (req, res, next) => {
  const rules = {
    name: 'required|string',
  };

  const validation = new Validator(req.body, rules);

  if (validation.fails()) {
    const errors = validation.errors.all();
    return res.status(400).json({ errors });
  }

  next();
};

const updateCompanyValidation = (req, res, next) => {
  const rules = {
    name: 'string',
  };

  const validation = new Validator(req.body, rules);

  if (validation.fails()) {
    const errors = validation.errors.all();
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  createCompanyValidation, updateCompanyValidation,
};