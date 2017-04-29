const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const Card = require(appRoot + "/models/cardModel");
const Img = require(appRoot + "/models/imgModel");
const imgService = require("./imgService");
const userService = require("./userService");
const logger = config.getLogger(__filename);

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
            reject({success:false, msg:String(err)});
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
           reject({success:false, msg:String(err)});
        });
    });
}

function createCard(card, urls, userId, callback){
    var cardModel = new Card(card);
    var user;
    validateCard(cardModel)
                            .then(()=>{
                                return userService.userCardLimitsOk(userId);
                            })
                            .then((result)=>{
                                user = result;
                                return imgService.downloadArray(urls, userId, callback)})
                           .then(imgHashes=>{
                                cardModel.creatorId = user._id;
                                cardModel.creatorName = user.name;
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
                            .catch(jsonMsj=>{
                                 logger.info(jsonMsj);
                                 return callback(jsonMsj);
                            });
};

function validateCard(cardModel){
    return new Promise((resolve,reject)=>{
            cardModel.validate(function (err) {
            if(err){
                logger.warn(String(err));
                reject({success:false, msg:String(err)});
            }
            else{
                resolve(cardModel);
            }
        });
    });
}

function getCards(userId, callback){
    userService.findById(userId, result=>{
          if(result.success === false)
                return callback({success:false, msg:"User does not exist"});
          const user = result.msg;
          if(user.cards.length === 0)
                return callback({success:true, msg:[]});
          var cardsId = user.cards;
          var results = [];
          var lap = 0;
          cardsId.forEach((cardId, index)=>{
            Card.findById(cardId).exec().then(card=>{
                results.push(card);
                if(lap === (cardsId.length - 1)){
                    sortCardArray(results);
                    return callback({success:true, msg:results});
                }
                lap++;
             }).catch((err)=>{
                    logger.error(String(err));
                    callback({success:false, msg:String(err)});
                })
            })
        })
}

function sortCardArray(array){
    array.sort(function(a,b){
                        // Turn your strings into dates, and then subtract them
                        // to get a value that is either negative, positive, or zero.
                        return new Date(b.updated_at) - new Date(a.updated_at);
                    });
}

function getAllCards(lastId, callback){
    var restrictions = {
        'isDuplicated':{$eq: false}
    }
    if(lastId)
        restrictions._id = {$lt: lastId}
    Card.find(restrictions).sort({created_at: 'desc'}).limit(8).exec((err, cards)=>{
        if(err){
            logger.error(err);
            return callback({success:false, msg:String(err)});
        }
        return callback({success:true, msg:cards});
    });
};


function cardRecommendations(userId, lastId, callback){
    userService.findById(userId, result=>{
        if(!result.success)
            return callback(result);
        const user = result.msg;
        var restrictions = {
            'isDuplicated':{$eq: false},
            'lang':user.lang,
             'creatorId': {$ne: userId}
        }
        if(lastId)
            restrictions._id = {$lt: lastId}
        Card.find(restrictions,{}, { sort:{updated_at: 'desc'}}).limit(8).exec((err, cards)=>{
            if(err){
                logger.error(err);
                return callback({success:false, msg:String(err)});
            }
            return callback({success:true, msg:cards});
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
                             const imgsHashes = card.imgs
                             return imgService.deleteImgsOnce(imgsHashes);
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

module.exports = {
    createCard: createCard,
    getCards: getCards,
    getAllCards: getAllCards,
    deleteCard: deleteCard,
    cardRecommendations: cardRecommendations
}