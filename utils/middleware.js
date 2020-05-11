const logger = require('./logger');

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method);
  logger.info('Path: ', req.path);
  logger.info('Body: ', req.body);
  logger.info('---');
  next();
};

// tests the id and returns true if the id onlhy contains digits false otherwise
const validId = (req, res, next) => {
  const id = req.params.id;
  const testRegex = /^\d+$/;;
  
  if(!testRegex.test(id)) {
    return next({ name: 'ValidationError', message: 'id can only contain digits' });
  }

  next();
};

// tests if the name contains only letters, digits and " " 
const validName = (req, res, next) => {
  const { name } = req.body;
  const testRegex = /^[A-Za-z0-9\s\-]+$/;

  if(name === '') {
    return true;
  }
  else if(!testRegex.test(name)) {
    return next( { name: 'ValidationError', message: 'name can only contain letters, digits and spaces' });
  }

  next();
};

// checks for missing properties
const checkIfMissingProperties = (req, res, next) => {
  const { name, quoteText, title, year } = req.body;

  if(!name || !quoteText || !title || !year) {
    return next({ name: 'MissingProperties', message: 'missing properties' });
  }

  next();
}

// custom error handling middleware used to set status code and error message based on specific error
const errorHandler = (error, req, res, next) => {
  logger.error(error);
  if (error.name === 'ValidationError') {
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

module.exports = { requestLogger, errorHandler, unknownEndpoint, validId, validName, checkIfMissingProperties };