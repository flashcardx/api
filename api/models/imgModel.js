const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);

const imgSchema = new Schema({

    hash: { type:String,
            required: [true, 'hash is required'],
            unique: [true, 'img hash already in use, has to be unique'], 
    },
    timesUsed:{
        type:Number,
        default: 1
    }
});

const img = mongoose.model('img', imgSchema);
img.on('index', function(error) {
  if(error)
        logger.error(error.message);
});

module.exports = img;