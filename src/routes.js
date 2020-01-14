const express = require("express");

const routes = express.Router();

routes.get('/', (req, res) => {
  return res.send('SOCKET API is alive!');
});

module.exports = routes;