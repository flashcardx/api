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
            createUsers()
            .then(result=>{
              var idRandomUser = result[0]._id;
              return createCards(idRandomUser);
            })
            .then(finish);
      /*    }*/
    });
};

function createCards(idRandomUser){
    return new Promise((resolve, reject)=>{
      const cardService = require(appRoot + "/service/cardService");
      seed.cards.forEach((card, index)=>{
        cardService.createCard(card, card.imgs, idRandomUser, (r)=>{
          if(r.success === false){
              logger.error(r.msg);
              return reject(r);
          }
          if(index === seed.cards.length-1)
            return resolve();
        });
      });
    });
}

function createUsers(result){
            logger.info("cards were created ok");
            return Users.create(seed.users);
};

function finish(results){
        logger.info("users were created ok");
        response.send("setup succeded!");
}


