const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);

const notifSchema = new Schema({

    date: {
        type: Date,
        expires: '90d',
        default: Date.now
    },
    ownerId:{
        type: Schema.Types.ObjectId,
        index: true
    },
    text:{
        type:String
    },
    seen:{
        type: Boolean,
        default: false
    },
    priority:{
        type: Number,
        default: 0
    }

});


const notificationModel = mongoose.model('Notification', notifSchema);
notificationModel.on('index', function(error) {
  if(error)
        logger.error(error.message);
});

module.exports = notificationModel;