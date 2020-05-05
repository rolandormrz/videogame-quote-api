const logger = require('./logger');

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method);
  logger.info('Path: ', req.path);
  logger.info('Body: ', req.body);
  logger.info('---');
  next();
};

const errorHandler = (error, req, res, next) => {
  if(error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }
  else if(error.name === 'ValidationError') {
    console.log('validation error encountered');
    return res.status(400).json({ error : error.message });
  }

  next(error);
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

module.exports = { requestLogger, errorHandler, unknownEndpoint };