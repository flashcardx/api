const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const seed = require(appRoot + "/config/seed");
const User = require(appRoot + "/models/userModel");
const Card = require(appRoot + "/models/cardModel");
const Img = require(appRoot + "/models/imgModel");
const imgService = require("./imgService");
const userService = require("./userService");
const logger = config.getLogger(__filename);
const mongoose = require("mongoose");
const AWSService = require("./AWSService");
const deckService = require("./deckService");

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

function saveCardClass(cardModel){
    return new Promise((resolve, reject)=>{
        cardModel.save().then(()=>{
            resolve(cardModel);
        }, (err)=>{
            logger.error(String(err));
            reject(String(err));
        });
    });
}

function createUserCard(parameters, callback){
    var cardModel = new Card(parameters.card);
    var user;
    var warning;
    validateCard(cardModel)
                            .then(()=>{
                                return userService.userCardLimitsOk(parameters.userId);
                            })
                            .then((result)=>{
                                user = result;
                                return imgService.downloadArray(parameters.imgs, parameters.userId, callback);
                            })
                           .then(r=>{
                                warning = r.warning;
                                cardModel.ownerId = user._id;
                                cardModel.ownerName = user.name;
                                cardModel.lang = user.lang;
                                if(r.imgHashes)
                                    cardModel.imgs = r.imgHashes.filter(v=>{
                                        if(objectIsNotEmpty(v))
                                            return true;
                                        return false;
                                    });
                                return saveCard(cardModel);
                           })
                           .then(()=>{
                                return userService.decreaseCardCounter(user);
                            })
                           .then(()=>{
                                return deckService.addCard(parameters.deckId, parameters.userId, cardModel._id);
                            })
                           .then(results=>{
                                    logger.debug(results);
                                    if(!warning)
                                        return callback({success:true, msg:"card was created ok!"});
                                    else
                                        return callback({success:"warning", msg:"card was created but: " + warning});        
                            })
                            .catch(msg=>{
                                 logger.info(msg);
                                 return callback({success:false, msg:msg});
                            });
};

function createClassCard(parameters, classname, callback){
    var cardModel = new Card(parameters.card);
    var user;
    var warning;
    var Class;
    validateCard(cardModel)
                            .then(()=>{
                                return userService.userCardLimitsOk(parameters.userId);
                            })
                            .then((result)=>{
                                user = result;
                                return classService.findClassLean(classname, userId, "_id name lang");
                            })
                            .then((result)=>{
                                if(!result)
                                    return Promise.reject("class not found, user must be in the class");
                                Class = result;
                                return imgService.downloadArray(parameters.imgs, parameters.userId, callback);
                            })
                           .then(r=>{
                                warning = r.warning;
                                cardModel.ownerId = Class._id;
                                cardModel.ownerName = Class.name;
                                cardModel.ownerType = "c";
                                cardModel.lang = Class.lang;
                                if(r.imgHashes)
                                    cardModel.imgs = r.imgHashes.filter(v=>{
                                        if(objectIsNotEmpty(v))
                                            return true;
                                        return false;
                                    });
                                return saveCard(cardModel);
                           })
                           .then(()=>{
                                return userService.decreaseCardCounter(user);
                            })
                           .then(()=>{
                                return deckService.addCard(parameters.deckId, Class._id, cardModel._id);
                            })
                           .then(()=>{
                                    if(!warning)
                                        return callback({success:true, msg:"card was created ok!"});
                                    else
                                        return callback({success:"warning", msg:"card was created but: " + warning});        
                            })
                            .catch(msg=>{
                                 logger.info(msg);
                                 return callback({success:false, msg:msg});
                            });
};

function objectIsNotEmpty(o){
    return Object.keys(o).length != 0;
}

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


function getCards(userId, params, callback){
    params.limit = parseInt(params.limit);
    if(!params.sort || (params.sort!=="asc" && params.sort!=="desc")){
        logger.warn("sort argument invalid(should be asc or desc), got: " + params.sort);
        params.sort= "asc";
    }
    if(params.limit <= 0)
        return callback({success: false, msg: "limit must be > 0"});
    userService.findById(userId, 'lang', result=>{
          if(result.success === false)
                return callback(result);
          const user = result.msg;
          var query = [{'ownerId': userId, 'lang':user.lang}];
          if(params.last){
            if(params.sort==="desc")
                query.push({updated_at:{$lt: params.last}});
            else
                query.push({updated_at:{$gt: params.last}});
          }
          if(params.name){
            query.push({name:{$regex : new RegExp(params.name, "i")}});
          }
       Card.find({$and: query }).select("name description imgs lang ownerName updated_at").sort({updated_at: params.sort}).limit(params.limit).exec(
                    (err, cards)=>{
                         return returnCards(err, cards, callback);
                    }
                );
        })
}

function getClassCards(classId, params, callback){
    params.limit = parseInt(params.limit);
    if(!params.sort || (params.sort!=="asc" && params.sort!=="desc")){
        logger.warn("sort argument invalid(should be asc or desc), got: " + params.sort);
        params.sort= "asc";
    }
    if(params.limit <= 0)
        return callback({success: false, msg: "limit must be > 0"});
    var query = [{'ownerId': classId}];
    if(params.last){
        if(params.sort=="desc")
            query.push({updated_at:{$lt: params.last}});
        else
            query.push({updated_at:{$gt: params.last}});
        }
    if(params.name){
            query.push({name:{$regex : new RegExp(params.name, "i")}});
        }
    CardClass.find({$and: query }).select("name description imgs ownerName updated_at").sort({updated_at: params.sort}).limit(params.limit).exec(
                    (err, cards)=>{
                         return returnCards(err, cards, callback);
                    }
            );
}

function returnCards(err, cards, callback){
        if(err){
                logger.error(err);
                return callback({success:false, msg:err});
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
    userService.findById(userId,'lang', result=>{
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
        Card.find(restrictions,{}, { sort:{counter: 'desc'}}).limit(8).select("counter name description imgs lang ownerName updated_at").exec((err, cards)=>{
            if(err){
                logger.error(err);
                return callback({success:false, msg:String(err)});
            }
            return AWSService.addTemporaryUrl(cards, callback);
        });
    });
}

function deleteCard(cardId, userId, callback){
    Card.findById(cardId).exec()
                        .then(card=>{
                             if(!card)
                                return Promise.reject("Card id does not exist");
                             return imgService.deleteImgsOnce(card.imgs);
                         })
                         .then(()=>{
                            return Card.find({ _id: cardId }).remove().exec();
                         })
                         .then(()=>{
                                return userService.increaseCardCounter(userId);
                         })
                         .then(()=>{
                             return userService.getUserLang(userId, r=>{
                                if(r.success == false){
                                    logger.error(r.msg);
                                    return callback(r);
                                }
                                const lang = r.msg;
                             return Promise.resolve();
                             });
                         })
                         .then(()=>{
                             return callback({success:true, msg:"Card deleted ok"});
                         })
                         .catch((err)=>{
                            logger.error("err: " +JSON.stringify(err));
                            return callback({success:false, msg:err});
                        });
};

function deleteCardClass(cardId, classId, callback){
    return CardClass.findById(cardId).exec()
                        .then(card=>{
                             if(!card)
                                return Promise.reject("Card id does not exist");
                             return imgService.deleteImgsOnce(card.imgs);
                         })
                         .then(()=>{
                            return CardClass.find({ _id: cardId }).remove().exec();
                         })
                        .then(()=>{
                            return callback({success:true});
                        })
                        .catch(err=>{
                            logger.error("error when deleting card class: " + err);
                            return callback({success:false, msg:err});
                        })
};

function duplicateCard2User(userId, cardIdOld, callback){
        Card.findById(cardIdOld, "name description imgs").exec().then(doc=>{
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
            createDuplicatedCard2User(card, userId, callback);
        });
}

function duplicateCard2Class(Class, cardIdOld, username, callback){
        Card.findById(cardIdOld, "name description imgs").exec().then(doc=>{
            if(!doc){
                logger.error("no card found for cardId: " + cardId + "(trying to duplicate card)");
                return callback({success:false, msg:"This card does not exist anymore"});
            }
             var card = {
                name: doc.name,
                description: doc.description,
                imgs: doc.imgs,
                classname: Class.name           
            };
            return createDuplicatedCard2Class(card, Class, username, callback);
        });
}

function duplicateCardUserClass(cardIdOld, userId, callback){
        CardClass.findById(cardIdOld, "name description imgs").exec().then(doc=>{
            if(!doc){
                logger.error("no card found for cardId: " + cardIdOld + "(trying to duplicate card from class to user)");
                return callback({success:false, msg:"This card does not exist anymore"});
            }
             var card = {
                name: doc.name,
                description: doc.description,
                imgs: doc.imgs,
                isDuplicated: true              
            };
            return createDuplicatedCard2User(card, userId, callback);
        });
}

function createDuplicatedCard2Class(card, Class, username, callback){
        card.ownerName = username;
        card.ownerId = Class._id;
        const cardModel = new CardClass(card);
        imgService.increaseImgsCounter(card.imgs)
                           .then(()=>{
                                return saveCardClass(cardModel);
                           })
                           .then(results=>{
                                    logger.debug(results);
                                    return callback({success:true, msg:cardModel});
                            })
                            .catch(jsonMsj=>{
                                 logger.warn(jsonMsj);
                                 return callback({success:false, msg:jsonMsj});
                            });

}

function createDuplicatedCard2User(card, userId, callback){
    userService.findById(userId,'name plan', (result)=>{
        if(result.success===false)
            return callback(result);
        const user = result.msg;
        card.ownerName = user.name;
        card.ownerId = userId;
        const cardModel = new Card(card);
        userService.userCardLimitsOk(userId)
                          .then(()=>{
                                return imgService.increaseImgsCounter(card.imgs);
                            })
                           .then(()=>{
                                return saveCard(cardModel);
                           })
                            .then(()=>{
                                return userService.decreaseCardCounter(user);
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

function setInitialCards(userId, callback){
            ownerUserEmail = seed.users[0].email;
            userService.findByEmail(ownerUserEmail, "_id", result=>{
                    if(result.success === false)
                        return callback(result);
                    var user = result.msg;
                    Card.findOne({'ownerId': user._id}).exec().then(doc=>{
                        if(!doc){
                            logger.error("user not found for userId: " + user._id);
                            return callback({success:false, msg:"This user does not exist"});
                        }
                        return duplicateCard2User(userId, doc, callback);
                    });
            })
}

function updateCard(id, userId, card, callback){
    Card.findOne({ '_id': id, ownerId: userId}, "name description _id").exec().then(doc=>{
            if(!doc){
                logger.error("no card found for cardId: " + id + ", with and userId: " + userId + "(trying to update card)");
                return callback({success:false, msg:"This card does not exist in the user collection"});
            }
            doc.name = card.name;
            doc.description = card.description;
            doc.update(doc, (err, updatedCard)=>{
                if(err){
                    logger.error(err);
                    return callback({success:false, msg: String(err)});
                }
                return callback({success:true, msg: updatedCard});

            });
    });
}

//verify if user who made request is in the class
function updateCardClass(cardId, classId, card, callback){
    CardClass.findOne({ '_id': cardId, ownerId: classId}, "name description _id").exec().then(doc=>{
            if(!doc){
                logger.error("no card found for cardId: " + cardId + ", with a classId: " + classId + "(trying to update card)");
                return callback({success:false, msg:"This card does not exist in the class collection"});
            }
            doc.name = card.name;
            doc.description = card.description;
            doc.update(doc, (err, updatedCard)=>{
                if(err){
                    logger.error(err);
                    return callback({success:false, msg: String(err)});
                }
                return callback({success:true, msg: updatedCard});
            });
    });
}



function findCardClassByIdLean(cardId, fields){
    return CardClass.findById(cardId, fields)
    .lean()
    .exec();
}

module.exports = {
    createUserCard: createUserCard,
    createClassCard: createClassCard,
    getCards: getCards,
    getAllCards: getAllCards,
    deleteCard: deleteCard,
    deleteCardClass: deleteCardClass,
    cardRecommendations: cardRecommendations,
    duplicateCard2User: duplicateCard2User,
    duplicateCard2Class: duplicateCard2Class,
    duplicateCardUserClass: duplicateCardUserClass,
    setInitialCards: setInitialCards,
    updateCard: updateCard,
    updateCardClass: updateCardClass,
    returnCards: returnCards,
    getClassCards: getClassCards,
    findCardClassByIdLean: findCardClassByIdLean
}