const express = require('express');
const app = require('./app');
const expressListEndpoints = require('express-list-endpoints');

const port = process.env.PORT || 3000;
const server = express();

server.use(app);

// Exibir as URLs disponíveis
if (process.env.NODE_ENV === 'development') {
  console.log(expressListEndpoints(app));
}

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
