const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const uniqueValidator = require('mongoose-unique-validator');
const validators = require("./validators/codeValidators");

const codeSchema = new Schema({
    hash:{
        type: String,
        unique: true,
        validate: validators.hashValidator
    },
    months:{
        type: Number,
        required: true
    },
    start: {
        type: Date
    },
    end: {
        type: Date
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "users",
        unique: true,
        sparse: true
    },
    school:{
        type: String,
        validate: validators.schoolValidator,
        index:true 
    }
});

codeSchema.plugin(uniqueValidator, { message: 'That {PATH} for the class already exists, it has to be unique' });

codeSchema.pre('update', function(next) {
  this.options.runValidators = true;
  next();
});

const Code = mongoose.model('Code', codeSchema);

//validator for unique constraints, dont throws error 11000 anymore

Code.on('index', function(error) {
  if(error)
        logger.error(error.message);
});

module.exports = Code;