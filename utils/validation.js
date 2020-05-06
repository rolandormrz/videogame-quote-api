// tests the id and returns true if the id onlhy contains digits false otherwise
const validId = id => {
  const testRegex = /^\d+$/;
  return testRegex.test(id);
};

// tests if the name contains only letters, digits and " " 
const validName = name => {
  const testRegex = /^[A-Za-z0-9\s]+$/;
  return testRegex.test(name);
};

module.exports = { validId, validName };
