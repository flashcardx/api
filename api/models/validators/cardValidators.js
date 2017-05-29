var validate = require('mongoose-validator');

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [1, 40],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

var descriptionValidator = [
  validate({
    validator: 'isLength',
    arguments: [0, 850],
    message: 'Description should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];



module.exports = {
    nameValidator: nameValidator,
    descriptionValidator: descriptionValidator
};