const express = require('express');
const app = express();
const cors = require('cors');
const quotesRouter = require('./controllers/quotes');
const middleware = require('./utils/middleware');

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(middleware.requestLogger);
// middleware used to validate data
app.post('/api/quotes', middleware.checkIfMissingProperties, middleware.validName);
app.put('/api/quotes/:id', middleware.validId, middleware.checkIfMissingProperties);
app.delete('/api/quotes/:id', middleware.validId);
// ---
app.use('/api/quotes', quotesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;