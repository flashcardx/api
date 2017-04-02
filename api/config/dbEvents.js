const appRoot = require('app-root-path');
const mongoose = require("mongoose");
const logger = require("./logger").getLogger(__filename);
const config = require("./index");

module.exports = function(){a

mongoose.connection.on('error', function onError(err) {
  logger.error('Mongoose default connection error: ' + err);
  mongoose.disconnect(); 
}); 

mongoose.connection.on('connecting', function onConnecting() {
    logger.info('connecting to MongoDB...');
});

mongoose.connection.on('connected', function onConnected() {
    logger.info('MongoDB connected!');
});

mongoose.connection.once('open', function onOpen() {
    logger.info('MongoDB connection opened!');
});

mongoose.connection.on('reconnected', function onReconnected() {
    logger.info('MongoDB reconnected!');
});

process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    logger.info('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
});
}

