const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const mongoose = require('mongoose');
const validators = require("./validators/cardValidators");
const Schema = mongoose.Schema;
const lang = config.lang;
var AutoIncrement = require('mongoose-sequence');

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
    imgs: [{
        hash:{
            type:String
        },
        width:{
            type:Number
        },
        height:{
            type: Number
        }
    }],
    lang:{
        type: String, 
        default: "en",
        enum: langCodes
    },
    isDuplicated:{
        type: Boolean,
        default: false
    },
    ownerName:{
        type:String
    },
    ownerId:{
         type: Schema.Types.ObjectId
    }
},
    {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

cardSchema.plugin(AutoIncrement, {inc_field: 'counter'});
const Card = mongoose.model('cards', cardSchema);

module.exports = Card;