const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const mongoose = require('mongoose');
const validators = require("./validators/cardValidators");
const Schema = mongoose.Schema;
const lang = config.lang;
var langCodes = lang.map((value)=>{
    return value.code;
});

const cardSchema = new Schema({
    name:{
        type: String,
        required: [true, 'name of flashcard is required'],
        validate: validators.nameValidator
        },
    description:{
        type: String,
        validate: validators.descriptionValidator
    },
    imgs: [String],
    lang:{
        type: String, 
        default: "en",
        enum: langCodes
    },
    isDuplicated:{
        type: Boolean,
        default: false
    },
    creatorName:{
        type:String
    },
    creatorId:{
         type: Schema.Types.ObjectId
    }
},
    {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

const Card = mongoose.model('cards', cardSchema);

module.exports = Card;