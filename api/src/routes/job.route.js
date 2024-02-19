const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const jobMiddleware = require('../middleware/job.middleware');

router.get('/jobs', jobController.getAllJobs);

router.get('/jobs/search', jobController.searchJobs);

router.get('/jobs/:id', jobController.getJobById);

router.post('/jobs', jobMiddleware.createJobValidation, jobController.addJob);

router.put('/jobs/:id', jobMiddleware.updateJobValidation, jobController.updateJob);

router.delete('/jobs/:id', jobController.deleteJob);

router.delete('/jobs', jobController.deleteAllJobs);

module.exports = router;