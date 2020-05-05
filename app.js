const express = require('express');
const app = express();
// import router when created
//const cors = require('cors');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');

//app.use(cors());
app.use(express.json());
// router
app.use(middleware.requestLogger);


app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;