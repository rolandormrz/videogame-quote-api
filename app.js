const express = require('express');
const app = express();
const quotesRouter = require('./controllers/quotes');
const middleware = require('./utils/middleware');

app.use(express.static('public'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use('/api/quotes', quotesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;