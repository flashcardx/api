/*
    ©2017 FlashCardX By: Pablo Nicolas Marino,
    https://github.com/pablonm3/FlashCardX/
        Powered By: https://pixabay.com/
*/
const bunyan = require("bunyan");
const mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
const express = require("express");
const packageJson = require("./package.json");
const config = require("./config");
const middleware = require("./middleware");
const controllers = require('./controller');
const app = express();
const logger = config.getLogger(__filename); 
const randomstring = require('randomstring');
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production'){
  require('longjohn');
}

app.set('jwtSecret', randomstring.generate()); 

mongoose.connect(config.getDbConnectionString(),  {server:{auto_reconnect:true}});

mongoose.connection.on('disconnected', function () {  
  logger.warn('Mongoose default connection disconnected'); 
  mongoose.connect(config.getDbConnectionString(),  {server:{auto_reconnect:true}});
});


config.dbEvents();
middleware(app);
controllers(app);


logger.info(packageJson.name + " starting ,  Version: " + packageJson.version);

app.listen(port);
