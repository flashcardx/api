const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const mongoose = require('mongoose');
const validators = require("./validators/cardValidators");
const Schema = mongoose.Schema;
var AutoIncrement = require('mongoose-sequence');

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
    ownerName:{
        type:String
    },
    ownerId:{
         type: Schema.Types.ObjectId,
         index:true
    },
    category:{
        type:String,
        default: ""
    },
    classname:{
        type: String
    }
},
    {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


cardSchema.index({"updated_at": 1});

cardSchema.pre('update', function(next) {
  this.options.runValidators = true;
  next();
});

const Card = mongoose.model('cardsClass', cardSchema);

Card.on('index', function(error) {
    if(error)
        logger.error(error.message);
});



module.exports = Card;