const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const mongoose = require('mongoose');
const validators = require("./validators/deckValidators");
const Schema = mongoose.Schema;


const deckDupSchema = new Schema({
    deckid: {
        type: Schema.Types.ObjectId
    },
    ownerid:{
        type: Schema.Types.ObjectId
    },
    date: {
        type: Date,
        expires: '14d',
        default: Date.now
    }
}
);

deckDupSchema.index({deckid: 1, ownerid: 1}, {unique: true});
const deckduplication = mongoose.model('deckduplications', deckDupSchema);

deckduplication.on('index', function(error) {
    if(error)
        logger.error(error.message);
});



module.exports = deckduplication;