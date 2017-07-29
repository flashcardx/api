var validate = require('mongoose-validator');

var textValidator = [
  validate({
    validator: 'isLength',
    arguments: [1, 5000],
    message: 'post text should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

var commentValidator = [
  validate({
    validator: 'isLength',
    arguments: [1, 800],
    message: 'comment text should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];



module.exports = {
    textValidator: textValidator,
    commentValidator: commentValidator
};