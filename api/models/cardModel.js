const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const mongoose = require('mongoose');
const validators = require("./validators/cardValidators");
const Schema = mongoose.Schema;

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
    isDuplicated:{
        type: Boolean,
        default: false
    },
    ownerName:{
        type:String
    },
    ownerId:{
         type: Schema.Types.ObjectId,
         ref: "users",
         index: true
    },
    deckId:{
         type: Schema.Types.ObjectId,
         ref: "decks",
         index: true
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

cardSchema.index({"updated_at": 1});
cardSchema.index({ownerId: 1, deckId: 1});

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