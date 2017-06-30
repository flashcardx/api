const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const Card = require(appRoot + "/models/cardModel");
const imgService = require("./imgService");
const cardService = require("./cardService");
const userService = require("./userService");
const logger = config.getLogger(__filename);
const mongoose = require("mongoose");
Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}

function listCards(userId, callback){
      userService.findById(userId, 'lang', result=>{
          if(result.success === false)
                return callback(result);
          const user = result.msg;
          var query = [{'ownerId': userId, 'lang':user.lang, 'supermemo.nextDueDate':{$lt: new Date()}}]; 
          Card.find({$and: query }).sort({'supermemo.nextDueDate':'asc'}).limit(8).exec()
          .then(cards=>{
                   return cardService.returnCards(null, cards, callback);
                    });
      });
}

function rankCard(userId, cardId, params, callback){
      if(params.performanceRating < 0 || params.performanceRating > 5){
            logger.error("performanceRating should be between 0 and 5 , got" + params.performanceRating);
            return callback({success:false, msg:"performanceRating should be between 0 and 5 , got" + params.performanceRating});
      }

      Card.findOne({ '_id': cardId, 'ownerId': userId }).exec().then(doc=>{
            if(!doc){
                logger.error("no card found for cardId: " + cardId + ", with and userId: " + userId + "(trying to rank card)");
                return callback({success:false, msg:"This card does not exist in the user collection"});
            }
            var correct = (params.performanceRating >= 3)? true : false;
            doc.supermemo.easiness += -0.8 + 0.28 * params.performanceRating + 0.02 * params.performanceRating * params.performanceRating;
            if(doc.supermemo.easiness > 5)
                  doc.supermemo.easiness = 5;
            if(doc.supermemo.easiness < 1.3)
                  doc.supermemo.easiness = 1.3;
            doc.supermemo.consecutiveCorrectAnswers = (correct===true)? doc.supermemo.consecutiveCorrectAnswers+1 : 0;
            var dateNow = new Date();
            if(correct === true){
                  var add = 6 * Math.pow(doc.supermemo.easiness, doc.supermemo.consecutiveCorrectAnswers - 1);
                  doc.supermemo.nextDueDate = dateNow.addDays(add);
            }
            else
                  doc.supermemo.nextDueDate = dateNow.addDays(1);
            doc.update(doc, (err, updatedCard)=>{
                if(err){
                    logger.error(err);
                    return callback({success:false, msg: String(err)});
                }
                return callback({success:true});
            });
      });
};

module.exports = {
      listCards: listCards,
      rankCard: rankCard
}