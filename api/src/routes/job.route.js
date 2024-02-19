const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const jobMiddleware = require('../middleware/job.middleware');

router.get('/job', jobController.getAllJobs);

router.get('/job/search', jobController.searchJobs);

router.get('/job/:id', jobController.getJobById);

router.post('/job', jobMiddleware.createJobValidation, jobController.addJob);

router.put('/job/:id', jobMiddleware.updateJobValidation, jobController.updateJob);

router.put('/job/:id/publish', jobController.publishJob);

router.put('/job/:id/archive', jobController.archiveJob);

router.delete('/job/:id', jobController.deleteJob);

router.delete('/job', jobController.deleteAllJobs);

module.exports = router;