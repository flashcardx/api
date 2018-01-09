var validate = require('mongoose-validator');

var hashValidator = [
  validate({
    validator: 'isLength',
    arguments: [10, 24],
    message: 'hash should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'isAlphanumeric',
    passIfEmpty: true,
    message: 'Hash should contain alpha-numeric characters only'
  })
];



var schoolValidator = [
  validate({
    validator: 'isLength',
    arguments: [4, 30],
    message: 'school should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'matches',
    arguments: ["English World Haedo"],
    message: 'school should match one of pre-setted values'
  })
];

module.exports = {
    hashValidator: hashValidator,
    schoolValidator: schoolValidator
};