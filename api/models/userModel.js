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
        unique: [true, 'email already in use, choose a different one'], 
        uniqueCaseInsensitive: true,
        default: null,
        validate: validators.emailValidator,
        sparse: true
    },
    name: {
        type:String, 
        required: [true, 'name is required'],
        validate: validators.nameValidator
    }, 
    password: {
        default: null,
        type: String,
        validate: validators.passwordValidator,
      }, 
    lang: {
        type: String, 
        default: "en",
        enum: langCodes
    },
    cards: {
        type: [Schema.Types.ObjectId],
        default: []
    },
    plan:{
        type:{
            type:String,
            default:"Basic"
        },
        maxLimit:{
            type: Number,
            default:300
        },
        cardLimit:{
            type: Number,
            default: 300
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
    categories:{
        type: [String],
        default: []
    },
    lastLogin:{
        type: Date
    },
    facebook:{
        id: {
            type: String,
            default: null,
            unique: [true, 'facebookId already in use'], 
            sparse: true
        },
        token: String
    }
});

//validator for unique constraints, dont throws error 11000 anymore
userSchema.plugin(uniqueValidator, { message: 'That {PATH} already exists, it has to be unique' });


userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    logger.error(error);
    //console.log(error);
    //next(new Error('email must be unique'));
  } else {
    next(error);
  }
});





const User = mongoose.model('users', userSchema);


module.exports = User;