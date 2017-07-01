const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const uniqueValidator = require('mongoose-unique-validator');
const lang = config.lang;
var langCodes = lang.map((value)=>{
    return value.code;
});

const classSchema = new Schema({
    name:{
        type: String,
        unique: true
    },
    description: {
        type: String
    },
    integrants: [{
        name:{
            type:String
        },
        id:{
            type:Schema.Types.ObjectId
        }
    }],
    owner:{
        name:{
            type:String
        },
        id:{
            type: Schema.Types.ObjectId
        }
    },
    waiting: [{
        name:{
            type:String
        },
        id:{
            type:Schema.Types.ObjectId
        }
    }],
    lang:{
        type: String,
        default: "en",
        enum: langCodes
    },
    maxLimit:{
        type:Number,
        default: 1000
    },
    cardsLeft:{
        type: Number,
        default: 1000
    },
    cards: [Schema.Types.ObjectId],
    maxUsers:{
        type: Number,
        default: 30
    },
    usersLeft:{
        type: Number,
        default: 30
    }
});

classSchema.plugin(uniqueValidator, { message: 'That {PATH} for the class already exists, it has to be unique' });

const Class = mongoose.model('Class', classSchema);

//validator for unique constraints, dont throws error 11000 anymore

Class.on('index', function(error) {
  if(error)
        logger.error(error.message);
});

module.exports = Class;