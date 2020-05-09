const logger = require('./logger');

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method);
  logger.info('Path: ', req.path);
  logger.info('Body: ', req.body);
  logger.info('---');
  next();
};

const errorHandler = (error, req, res, next) => {
  logger.error(error);
  if(error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }
  else if (error.name === 'ValidationError') {
    console.log('validation error encountered');
    return res.status(400).json({ error : error.message });
  }
  else if(error.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json(error);
  }
  else if(error.name === 'NotFound') {
    return res.status(404).json({ error: error.message });
  }
  else if(error.name === 'MissingProperties') {
    return res.status(400).json({ error: error.message });
  }

  return res.status(500).json(error);
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

module.exports = { requestLogger, errorHandler, unknownEndpoint };