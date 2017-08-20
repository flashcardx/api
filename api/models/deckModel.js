const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const mongoose = require('mongoose');
const validators = require("./validators/deckValidators");
const Schema = mongoose.Schema;
const lang = config.lang;


const deckSchema = new Schema({
    decks:{
        type: [Schema.Types.ObjectId],
        ref: "decks"
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
    thumbnail: {
        type: String
    },
    ownerType:{
        type: String,
        enum: ["u", "c"],
        default: "u"
    },
    ownerId:{
        type:  Schema.Types.ObjectId
        },
    cards:{
        type: [Schema.Types.ObjectId],
        ref: "cards"
    },
    duplicates:{
        type: Number,
        default: 0
    }
},
    {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


deckSchema.pre('update', function(next) {
  this.options.runValidators = true;
  next();
});

const Deck = mongoose.model('decks', deckSchema);

Deck.on('index', function(error) {
    if(error)
        logger.error(error.message);
});



module.exports = Deck;