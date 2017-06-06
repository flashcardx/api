const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require("mongoose");
const seed = require(appRoot + "/config/seed");
const config = require(appRoot + "/config");
const Cards = require(appRoot + "/models/cardModel");
const Users = require(appRoot + "/models/userModel");
const logger = config.getLogger(__filename);

// todo: translate db boilerplate logic to a service
var response; 
module.exports = function(app){

    app.get("/setup", function(req, res){
         /* if(env !== "development" && env !== "pi"){
            logger.warn(req.connection.remoteAddress + " tried to access /setup in " + env);
            res.send("setup not available at this environment");
          }
          else{*/
            response = res;
            logger.warn("database is about to be dropped");
            mongoose.connection.db.dropDatabase();
            createCollections().then(createUsers)
                               .then(finish);
      /*    }*/
    });
};

function createCollections(){
            return Cards.create(seed.cards);
}

function createUsers(result){
            logger.info("cards were created ok");
            return Users.create(seed.users);
};

function finish(results){
        logger.info("users were created ok");
        response.send("setup succeded!");
}


