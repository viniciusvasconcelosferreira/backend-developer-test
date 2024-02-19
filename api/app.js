require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const companyRoutes = require('./src/routes/company.route');
const jobRoutes = require('./src/routes/job.route');

app.use(cors());
app.use(express.json());
app.use('/api/v1/', companyRoutes);
app.use('/api/v1/', jobRoutes);

app.get('/', (req, res) => {
  res.send('Olá, mundo!');
});

module.exports = app;
