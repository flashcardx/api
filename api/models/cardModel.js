const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
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
    ownerType:{
        type: String,
        enum: ["u", "c"],
        default: "u"
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
         type: Schema.Types.ObjectId,
         index:true
    },
    counter:{
        type:Number,
        unique: true
    },
    supermemo:{
        easiness:{
            type:Number,
            default: 2.5
        },
        consecutiveCorrectAnswers:{
            type: Number,
            default: 0
        },
        nextDueDate:{
            type: Date,
            default: Date.now,
            index:true
        }    
    }
},
    {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

cardSchema.plugin(AutoIncrement, {inc_field: 'counter'});
cardSchema.index({"updated_at": 1});

cardSchema.pre('update', function(next) {
  this.options.runValidators = true;
  next();
});



const Card = mongoose.model('cards', cardSchema);

Card.on('index', function(error) {
    if(error)
        logger.error(error.message);
});



module.exports = Card;