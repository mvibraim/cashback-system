const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

module.exports = (apiRoot, routes) => {
  const app = express()

  app.use(helmet());
  app.use(bodyParser.json());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(compression())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(apiRoot, routes)

  return app
}
