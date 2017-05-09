const appRoot = require('app-root-path');
const config = require(appRoot + "/config");

var logger = config.getLoggerAccess(__filename);

module.exports = function(app){
   
  app.use(function(req,res,next){
       logger.debug({req:req}, " request received");
       next();
   });

};