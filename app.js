const express = require('express');
const app = express();
const quotesRouter = require('./controllers/quotes');
//const cors = require('cors');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');

//app.use(cors());
app.use(express.json());
app.use('/api/quotes', quotesRouter);
app.use(middleware.requestLogger);


app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;