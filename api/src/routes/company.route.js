const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const companyMiddleware = require('../middleware/company.middleware');

router.get('/companies', companyController.getAllCompanies);

router.get('/companies/search', companyController.searchCompanies);

router.get('/companies/:id', companyController.getCompanyById);

router.post('/companies', companyMiddleware.createCompanyValidation, companyController.addCompany);

router.put('/companies/:id', companyMiddleware.updateCompanyValidation, companyController.updateCompany);

router.delete('/companies/:id', companyController.deleteCompany);

router.delete('/companies', companyController.deleteAllCompanies);

module.exports = router;