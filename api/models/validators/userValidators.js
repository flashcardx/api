var validate = require('mongoose-validator');

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 50],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'matches',
    arguments: /^[a-z ,.'-]+$/i,
    passIfEmpty: true,
    message: 'Name has invalid characters :('
  })
];

var emailValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 50],
    message: 'email should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'isEmail',
    message: 'email format is invalid'
  }),
];

var passwordValidator = [
  validate({
    validator: 'isLength',
    arguments: [4, 60],
    message: 'password should be between {ARGS[0]} and {ARGS[1]} characters'
  }),

];

module.exports = {
    nameValidator: nameValidator,
    emailValidator: emailValidator,
    passwordValidator: passwordValidator
};