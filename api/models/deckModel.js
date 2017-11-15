const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const mongoose = require('mongoose');
const validators = require("./validators/deckValidators");
const Schema = mongoose.Schema;
const lang = config.lang;
var langCodes = lang.map((value)=>{
    return value.code;
});
const DEFAULT_RECURSIVE_ORDER = 4;

const deckSchema = new Schema({
    parentId:{
        type: Schema.Types.ObjectId,
        ref: "decks",
        index:true
    },
    name:{
        type: String,
        required: [true, 'name of deck is required'],
        validate: validators.nameValidator
        },
    description:{
        type: String,
        validate: validators.descriptionValidator
    },
    img: {
        hash:{
            type: String
        },
        width:{
            type:Number
        },
        height:{
             type:Number
        }
    },
    ownerType:{
        type: String,
        enum: ["u", "c"],
        default: "u"
    },
    ownerId:{
        type: Schema.Types.ObjectId,
        index: true
        },
    duplicates:{
        type: Number,
        default: 0
    },
    recursiveOrder:{
        type: Number,
        default: DEFAULT_RECURSIVE_ORDER
    },
    lang:{
        type: String,
        default: "en",
        enum: langCodes
    },
    active:{
        type: Boolean,
        default: true
    }
},
    {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

deckSchema.index({recursiveOrder: 1, _id: 1});
deckSchema.pre('update', function(next) {
  this.options.runValidators = true;
  next();
});

const Deck = mongoose.model('decks', deckSchema);

Deck.on('index', function(error) {
    if(error)
        logger.error(error.message);
});



module.exports = {
    deck:Deck,
    DEFAULT_RECURSIVE_ORDER: DEFAULT_RECURSIVE_ORDER
}