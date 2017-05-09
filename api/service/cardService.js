const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const Card = require(appRoot + "/models/cardModel");
const Img = require(appRoot + "/models/imgModel");
const imgService = require("./imgService");
const userService = require("./userService");
const logger = config.getLogger(__filename);
const mongoose = require("mongoose");
const AWSService = require("./AWSService");

function downloadSaveImgs(userId, cardModel, urls){
    return new Promise((resolve, reject)=>{
        imgService.downloadArray(urls, userId);
    });
}

function saveCard(cardModel){
    return new Promise((resolve, reject)=>{
        cardModel.save().then(()=>{
            resolve(cardModel);
        }, (err)=>{
            logger.error(String(err));
            reject(String(err));
        });
    });
}

function linkCardUser(userId, cardModel){
    return new Promise((resolve, reject)=>{
        User.findById(userId).exec().then((user)=>{
            user.cards.push(cardModel._id);
            user.save().then(()=>{
                resolve(user);
                }, (err)=>{
                 logger.error(String(err));
                 reject({success:false, msg:String(err)});
            });
        }).catch((err)=>{
           logger.error(String(err));
           reject(String(err));
        });
    });
}

function createCard(card, imgs, userId, callback){
    var cardModel = new Card(card);
    var user;
    validateCard(cardModel)
                            .then(()=>{
                                return userService.userCardLimitsOk(userId);
                            })
                            .then((result)=>{
                                user = result;
                                return imgService.downloadArray(imgs, userId, callback)})
                           .then(imgHashes=>{
                                cardModel.ownerId = user._id;
                                cardModel.ownerName = user.name;
                                cardModel.lang = user.lang;
                                cardModel.imgs = imgHashes;
                                return saveCard(cardModel);
                           })
                           .then(()=>{
                               return linkCardUser(userId, cardModel)})
                           .then(results=>{
                                    logger.debug(results);
                                    return callback({success:true, msg:"card was created ok!"});
                                })
                            .catch(msj=>{
                                 logger.info(msj);
                                 return callback({success:false, msj:msj});
                            });
};

function validateCard(cardModel){
    return new Promise((resolve,reject)=>{
            cardModel.validate(function (err) {
            if(err){
                logger.warn(String(err));
                reject(String(err));
            }
            else{
                resolve(cardModel);
            }
        });
    });
}

//lastPosition starts from 0
function getCards(userId, last, limit, callback){
    limit = parseInt(limit);
    if(limit <= 0)
        return callback({success: false, msg: "limit must be > 0"});
    userService.findById(userId, result=>{
          if(result.success === false)
                return callback(result);
          const user = result.msg;
         if(last){
                Card.find({$and: [{'_id':{ $in: user.cards}}, {updated_at:{$lt: last}}] }).sort({updated_at: 'desc'}).limit(limit).exec(
                    (err, cards)=>{
                         return returnCards(err, cards, callback);
                    }
                );    
            }
         else{
             Card.find({'_id':{ $in: user.cards} }).sort({updated_at: 'desc'}).limit(limit).exec(
                    (err, cards)=>{
                        return returnCards(err, cards, callback);
                    }
                );    
             }
        })
}

function returnCards(err, cards, callback){
        if(err){
                logger.error(err);
                return callback({success:false, msg:String(err)});
            }
      return AWSService.addTemporaryUrl(cards, callback);
}

function getAllCards(last, callback){
    var restrictions = {
        'isDuplicated':{$eq: false}
    }
    if(last)
        restrictions.counter = {$lt: last}
    Card.find(restrictions).sort({counter: 'desc'}).limit(8).exec((err, cards)=>{
        if(err){
            logger.error(err);
            return callback({success:false, msg:String(err)});
        }
        return AWSService.addTemporaryUrl(cards, callback);
    });
};


function cardRecommendations(userId, last, callback){
    userService.findById(userId, result=>{
        if(!result.success)
            return callback(result);
        const user = result.msg;
        var restrictions = {
            'isDuplicated':{$eq: false},
            'lang':user.lang,
             'ownerId': {$ne: userId}
        }
        if(last)
            restrictions.counter = {$lt: last}
        Card.find(restrictions,{}, { sort:{counter: 'desc'}}).limit(8).exec((err, cards)=>{
            if(err){
                logger.error(err);
                return callback({success:false, msg:String(err)});
            }
            return AWSService.addTemporaryUrl(cards, callback);
        });
    });
}

function deleteCard(cardId, userId, callback){
    userService.deleteCardFromUser(cardId, userId)
                        .then(()=>{
                            return Card.findById(cardId).exec();
                        })
                        .then(card=>{
                             if(!card)
                                throw new Error("Card id does not exist");
                             return imgService.deleteImgsOnce(card.imgs);
                         })
                         .then(()=>{
                            return Card.find({ _id: cardId }).remove().exec();
                         })
                         .then(()=>{
                             return callback({success:true, msg:"Card deleted ok"});
                         })
                         .catch((err)=>{
                            logger.error(err);
                            return callback({success:false, msg:String(err)});
                        });
};

function duplicateCard(userId, cardIdOld, callback){
        Card.findById(cardIdOld).exec().then(doc=>{
            if(!doc){
                logger.error("no card found for cardId: " + cardId + "(trying to duplicate card)");
                return callback({success:false, msg:"This card does not exist anymore"});
            }
             var card = {
                name: doc.name,
                description: doc.description,
                imgs: doc.imgs,
                isDuplicated: true                
            };
            createDuplicatedCard(card, userId, callback);
        });
}

function createDuplicatedCard(card, userId, callback){
    userService.findById(userId, (result)=>{
        if(result.success===false)
            return callback(result);
        const user = result.msg;
        card.ownerName = user.name;
        card.ownerId = user._id;
        const cardModel = new Card(card);
        userService.userCardLimitsOk(userId)
                          .then(()=>{
                                return imgService.increaseImgsCounter(card.imgs);
                            })
                           .then(()=>{
                                return saveCard(cardModel);
                           })
                           .then(()=>{
                               return linkCardUser(userId, cardModel)
                            })
                           .then(results=>{
                                    logger.debug(results);
                                    return callback({success:true, msg:"Card was duplicated ok!"});
                                })
                            .catch(jsonMsj=>{
                                 logger.info(jsonMsj);
                                 return callback(jsonMsj);
                            });

    });
}

module.exports = {
    createCard: createCard,
    getCards: getCards,
    getAllCards: getAllCards,
    deleteCard: deleteCard,
    cardRecommendations: cardRecommendations,
    duplicateCard: duplicateCard
}