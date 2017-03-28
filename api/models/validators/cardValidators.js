var validate = require('mongoose-validator');

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [1, 40],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'matches',
    arguments: /^[a-z 0-9,.'-]+$/i,
    passIfEmpty: true,
    message: 'Name has invalid characters :('
  })
];

var descriptionValidator = [
  validate({
    validator: 'isLength',
    arguments: [1, 70],
    message: 'Description should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'matches',
    arguments: /^[a-z 0-9,.'-]+$/i,
    passIfEmpty: true,
    message: 'Description has invalid characters :('
  })
];



module.exports = {
    nameValidator: nameValidator,
    descriptionValidator: descriptionValidator
};