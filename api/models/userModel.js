const appRoot = require('app-root-path');
const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const validators = require("./validators/userValidators");
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const lang = config.lang;
var langCodes = lang.map((value)=>{
    return value.code;
});

const userSchema = new Schema({
    email:{
        type:String,
        sparse: true,
        unique: [true, 'email already in use, choose a different one'], 
        uniqueCaseInsensitive: true,
        validate: validators.emailValidator
    },
    name: {
        type:String, 
        required: [true, 'name is required'],
        validate: validators.nameValidator
    }, 
    password: {
        type:String
    },
    lang: {
        type: String, 
        default: "en",
        enum: langCodes
    },
    plan:{
        isPremium:{
            type:Boolean,
            default:false
        },
        maxLimit:{
            type: Number,
            default:2000
        },
        cardsLeft:{
            type: Number,
            default: 2000,
            min: [0, 'card limit reached'],
            max: [2000, 'card limit reached']
        }
    },
    preferences:{
        recycleMode:{
            type: Boolean,
            default: false    
        },
        autoComplete:{
            type:Boolean,
            default: true
        }
    },
    lastLogin:{
        type: Date
    },
    facebook:{
        id: {
            type: String,
            unique: [true, 'facebookId already in use'], 
            sparse: true
        },
        token: String
    },
    classLimit:{
        type: Number,
        default: 30
    },
    classesLeft:{
        type: Number, 
        default: 30,
        min: [0, 'class limit reached'],
        max: [30, 'class limit reached']
    },
    notificationCounter:{
        type: Number, 
        default: 0
    },
    thumbnail:{
        type: String,
        ref: "img"
    },
    classes: [{
        lang: {
            type: String,
            default: "en",
            enum: langCodes
        },
        id:{
            type: Schema.Types.ObjectId
        },
        isAdmin:{
            type: Boolean, 
            default: false
        },
        _id: false //disable mongoose autogenerated id
    }]
});

//validator for unique constraints, dont throws error 11000 anymore
userSchema.plugin(uniqueValidator, { message: 'That {PATH} already exists, it has to be unique' });


userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    logger.warn(error);
  } else {
    next(error);
  }
});

userSchema.pre('update', function(next) {
    logger.debug("update pre hook");
  this.options.runValidators = true;
  next();
});

userSchema.pre('findOneAndUpdate', function(next) {
    logger.debug("findOneAndUpdate pre hook");
  this.options.runValidators = true;
  next();
});


const User = mongoose.model('users', userSchema);

User.on('index', function(error) {
  if(error)
        logger.error(error.message);
});

module.exports = User;