const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);

const notifSchema = new Schema({

     date: {
        type: Date,
        expires: '6m',
        default: Date.now
    },
    type:{
        type:Number,
        enum: ['fromUser', 'fromOwner']
    },
    ownerId:{
        type: Schema.Types.ObjectId,
        index: true
    },
    className: {
        type: String
    },
    username:{
        type:String
    },
    userId:{
        type: Schema.Types.ObjectId
    },
    seen:{
        type: Boolean,
        default: false
    },
    classId: {
        type: Schema.Types.ObjectId
    }

});

const Notification = mongoose.model('Notification', notifSchema);
notification.on('index', function(error) {
  if(error)
        logger.error(error.message);
});

module.exports = notification;