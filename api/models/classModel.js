const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const uniqueValidator = require('mongoose-unique-validator');
const validators = require("./validators/classValidators");
const lang = config.lang;
var langCodes = lang.map((value)=>{
    return value.code;
});

const classSchema = new Schema({
    name:{
        type: String,
        unique: true,
        sparse: true,
        validate: validators.nameValidator
    },
    description: {
        type: String,
        validate: validators.descriptionValidator
    },
    integrants: [{type:Schema.Types.ObjectId, ref: "users"}],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    waiting: [{type:Schema.Types.ObjectId, ref: "users"}],
    lang:{
        type: String,
        default: "en",
        enum: langCodes
    },
    maxLimit:{
        type:Number,
        default: 3000
    },
    cardsLeft:{
        type: Number,
        default: 3000,
        min: [0, 'cards limit reached'],
        max: [3000, 'cards limit reached']
    },
    maxUsers:{
        type: Number,
        default: 30
    },
    usersLeft:{
        type: Number,
        default: 29,
        min: [0, 'users limit reached'],
        max: [29, 'users limit reached']
    },
    isPrivate:{
        type: Boolean,
        default: false
    },
    isActive:{
        type: Boolean,
        default: true
    },
    rank:{      //represents the priority of a class to be listed in the class suggestions
        type:Number,
        default:0,
        index: true
    },
    thumbnailHash:{
          type:String
    }
},{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


classSchema.plugin(uniqueValidator, { message: 'That {PATH} for the class already exists, it has to be unique' });

classSchema.pre('update', function(next) {
  this.options.runValidators = true;
  next();
});


const Class = mongoose.model('Class', classSchema);

//validator for unique constraints, dont throws error 11000 anymore

Class.on('index', function(error) {
  if(error)
        logger.error(error.message);
});

module.exports = Class;