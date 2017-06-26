const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);

const lrSchema = new Schema({

    userId:{
        type: Schema.Types.ObjectId
    },
    userEmail:{
        type: String
    },
    date: {
        type: Date,
        expires: '8h',
        default: Date.now,
        index: true
    }
});


const model = mongoose.model('loginRegistry', lrSchema);
model.on('index', function(error) {
  if(error)
        logger.error(error.message);
});


module.exports = model;