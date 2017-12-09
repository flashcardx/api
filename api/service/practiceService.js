const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const Card = require(appRoot + "/models/cardModel");
const imgService = require("./imgService");
const AWSService = require("./AWSService");
const userService = require("./userService");
const cacheService = require("./cacheService");
const deckService = require("./deckService");
const logger = config.getLogger(__filename);
const mongoose = require("mongoose");
const {stringDifference} = require(appRoot + "/utils/string");
const _ = require("lodash");
Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}

function listCards(userId, deckId, callback){
      deckService.getAllDescendantIds(deckId)
      .then(deckIds=>{
            var query = [{deckId: {$in: deckIds}}, {'ownerId': userId}, {'supermemo.nextDueDate':{$lt: new Date()}}]; 
            Card.find({$and: query }).sort({'supermemo.nextDueDate':'asc'})
            .populate("deckId", "lang")
            .limit(10)
            .lean()
            .exec()
            .then(cards=>{
                  return AWSService.addTemporaryUrl(cards, callback);
            });
      })
      .catch(err=>{
            return callback({success:false, msg:err});
      });
}

function rankCard(userId, cardId, name, callback){
      Card.findOne({ '_id': cardId, 'ownerId': userId , 'supermemo.nextDueDate':{$lt: new Date()}}).exec().then(card=>{
            if(!card){
                logger.error("no card found for cardId: " + cardId + ", with and userId: " + userId + "(trying to rank card)");
                return callback({success:false, msg:"This card does not exist in the user collection"});
            }
            var rank = compareAndRank(card.name, name);
            var dateNow = new Date();
            card.supermemo.nextDueDate = dateNow.addDays(calcDaysAndUpdateSupermemo(card.supermemo, rank));
            card.update(card, (err, updatedCard)=>{
                if(err){
                    logger.error(err);
                    return callback({success:false, msg: String(err)});
                }
                  increasePoints(userId, rank)
                  .then(({hit, points})=>{
                      return callback({success:true, rank:rank, points:points, hit:hit});
                  })
                  .catch(err=>{
                        return callback({success:false, msg:err});
                  })
            });
      });
}

function increasePoints(userId, rank){
      return new Promise((resolve, reject)=>{
            var points = rank * 6;
            var times;
            var hit;
            cacheService.getUserPracticeResults(userId)
            .then(r=>{
                  r = parseInt(r);
                  var times = (r && rank==5)? r+1 : 1;
                  if(times%5==0){
                        points*=times;
                        hit = times;
                  }
                  cacheService.putUserPracticeResults(userId, times);
                  return userService.increasePoints(userId, points);
            })
            .then(()=>{
                  return resolve({hit:hit, points:points});
            })
            .catch(err=>{
                  return reject(err);
            });
      })
}


function compareAndRank(realName, input){
      difference = stringDifference(realName, input);
      if(difference==0)
            return 5;
      if(difference<=2)
            return 3;
      return 1;
}

function calcDaysAndUpdateSupermemo(supermemo, performanceRating){
      var correct = (performanceRating >= 3)? true : false;
     supermemo.easiness += -0.8 + 0.28 * performanceRating + 0.02 * performanceRating * performanceRating;
     if(supermemo.easiness > 5)
            supermemo.easiness = 5;
     if(supermemo.easiness < 1.3)
            supermemo.easiness = 1.3;
     supermemo.consecutiveCorrectAnswers = (correct===true)? supermemo.consecutiveCorrectAnswers+1 : 0;
     if(correct === true)
            return 6 * Math.pow(supermemo.easiness, supermemo.consecutiveCorrectAnswers - 1);
     else
        return 1;
}



module.exports = {
      listCards: listCards,
      rankCard: rankCard
}