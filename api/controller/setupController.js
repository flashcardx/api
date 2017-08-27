const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require("mongoose");
const seed = require(appRoot + "/config/seed");
const config = require(appRoot + "/config");
const Cards = require(appRoot + "/models/cardModel");
const Users = require(appRoot + "/models/userModel");
const logger = config.getLogger(__filename);



module.exports = function(app){

    app.get("/setup", function(req, res){
         /* if(env !== "development" && env !== "pi"){
            logger.warn(req.connection.remoteAddress + " tried to access /setup in " + env);
            res.send("setup not available at this environment");
          }
          else{*/
            logger.warn("database is about to be dropped");
            mongoose.connection.db.dropDatabase();
            createUsers()
            .then(()=>{
              logger.info("users were created ok");
              res.send("setup succeded!");
            })
            .catch(err=>{
                    logger.error("err: " + err);
                    return res.send({success:false, msg:err});
                });
      /*    }*/
    });
};

function createUsers(result){
            logger.info("cards were created ok");
            return Users.create(seed.users);
};

