const Validator = require('validatorjs');
const { pool } = require('../../config/db.config');


const validateExistence = async (req, requirement, errors) => {
  let attArr = requirement.split(',');
  const { 0: table, 1: column } = attArr;
  const result = await pool.query('SELECT ' + column + ' FROM ' + table + ' WHERE ' + column + ' = $1', [req.body.company_id]);
  if (result.rows.length === 0) {
    errors.validation = errors.validation || {};
    errors.validation.company_id = [`This ${column} does not exist in the ${table} table`];
  }
};

const validateJob = async (req, res, next, rules) => {
  const validation = new Validator(req.body, rules);
  const errors = {};
  if (validation.fails()) {
    errors.validation = validation.errors.all();
  }

  await validateExistence(req, 'companies,id', errors);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const createJobValidation = async (req, res, next) => {
  const rules = {
    title: 'required|string',
    description: 'required|string',
    location: 'required|string',
    notes: 'string',
    status: 'in:draft,published,archived,rejected',
    company_id: 'required|string|regex:/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
  };

  await validateJob(req, res, next, rules);
};

const updateJobValidation = async (req, res, next) => {
  const rules = {
    title: 'string',
    description: 'string',
    location: 'string',
    notes: 'string',
    status: 'in:draft,published,archived,rejected',
  };

  await validateJob(req, res, next, rules);
};

module.exports = {
  createJobValidation, updateJobValidation,
};