const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);

const pollySchema = new Schema({

    hash: { type:String,
            required: [true, 'hash is required'],
            index: true
    },
    timesUsed:{
        type:Number,
        default: 0
    }
});

const polly = mongoose.model('polly', pollySchema);
polly.on('index', function(error) {
  if(error)
        logger.error(error.message);
});

module.exports = polly;