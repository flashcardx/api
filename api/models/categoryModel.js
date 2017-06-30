const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);

const catSchema = new Schema({

    ownerId: {
        type:Schema.Types.ObjectId,
        required: [true, 'ownerId is required'],
        index: true
    },
    lang:{
        type: String
    },
    name:{
        type: String
    }
});

const category = mongoose.model('category', catSchema);
category.on('index', function(error) {
  if(error)
        logger.error(error.message);
});

module.exports = category;