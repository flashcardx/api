var validate = require('mongoose-validator');

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [0, 40],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
    validate({
    validator: 'matches',
    arguments: /[^/]+$/i,
    passIfEmpty: true,
    message: 'Class name has invalid characters :('
  })
];

var descriptionValidator = [
  validate({
    validator: 'isLength',
    arguments: [0, 400],
    message: 'Description should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];




module.exports = {
    nameValidator: nameValidator,
    descriptionValidator: descriptionValidator
};