/*
    ©2017 FlashCardX By: Pablo Nicolas Marino,
    http://www.flashcard-x.com
*/

const appRoot = require('app-root-path');
const env = process.env.NODE_ENV || "development";
const bunyan = require("bunyan");
const mongoose = require("mongoose");
require('mongoose').Promise = global.Promise;
const express = require("express");
const packageJson = require("./package.json");
const config = require("./config");
const middleware = require("./middleware");
const controllers = require('./controller');
const app = express();
const logger = config.getLogger(__filename); 
const randomstring = require('randomstring');

const port = process.env.PORT || 3000;
if (env != 'production'){
  require('longjohn');
}
app.set('jwtSecret', randomstring.generate()); 

mongoose.connect(config.getDbConnectionString(),  {server:{auto_reconnect:true}});

mongoose.connection.on('disconnected', function () {  
  logger.warn('Mongoose default connection disconnected'); 
  mongoose.connect(config.getDbConnectionString(),  {server:{auto_reconnect:true}});
});

if(env != "production")
    app.use(express.static('public'));
config.dbEvents();
middleware.init(app);
controllers(app);
logger.info(packageJson.name + " starting ,  Version: " + packageJson.version);

process.on('uncaughtException', err=>{
                        logger.error(err);
                    }); 

require(appRoot + "/service/deckService").initChild();
app.listen(port);