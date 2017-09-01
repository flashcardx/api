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

function createUserCard(parameters, callback){
    parameters.card.deckId = parameters.deckId;
    var cardModel = new Card(parameters.card);
    var user;
    var warning;
    validateCard(cardModel)
                            .then(()=>{
                                return deckService.validateOwnership(parameters.userId, parameters.deckId);
                            })
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
                                if(r.imgHashes)
                                    cardModel.imgs = r.imgHashes.filter(v=>{
                                        if(objectIsNotEmpty(v))
                                            return true;
                                        return false;
                                    });
                                return saveCardUser(cardModel, parameters.userId,  parameters.deckId);
                           })
                           .then(()=>{
                                    if(!warning)
                                        return callback({success:true, msg:"card was created ok!"});
                                    else
                                        return callback({success:"warning", msg:"card was created but: " + warning});        
                            })
                            .catch(msg=>{
                                 logger.error(msg);
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
    //we don't verify user is the deck owner since other people have access to all users decks
    params.limit = parseInt(params.limit);
    if(!params.sort || (params.sort!=="asc" && params.sort!=="desc")){
        logger.warn("sort argument invalid(should be asc or desc), got: " + params.sort);
        params.sort= "asc";
    }
    if(params.limit <= 0)
        return callback({success: false, msg: "limit must be > 0"});
    var query = [{'ownerId': userId}, {"ownerType": "u"}];
    if(params.deckId)
        query.push({"deckId": params.deckId});
    if(params.last){
        if(params.sort==="desc")
            query.push({updated_at:{$lt: params.last}});
        else
            query.push({updated_at:{$gt: params.last}});
    }
    if(params.name){
            query.push({name:{$regex : new RegExp(params.name, "i")}});
    }
       Card.find({$and: query }).select("name description imgs ownerName updated_at").sort({updated_at: params.sort}).limit(params.limit).exec(
                    (err, cards)=>{
                         return returnCards(err, cards, callback);
                    }
        );
}

function getClassCardsUnsafe(classId, params, callback){
    params.limit = parseInt(params.limit);
    if(!params.sort || (params.sort!=="asc" && params.sort!=="desc")){
        logger.warn("sort argument invalid(should be asc or desc), got: " + params.sort);
        params.sort= "asc";
    }
    if(!params.limit)
        params.limit=12;
    if(params.limit <= 0 || params.limit > 50)
        return callback({success: false, msg: "limit must be > 0 and <50"});
    var query = [{'ownerId': classId},{"ownerType": "c"}];
    if(params.last){
        if(params.sort=="desc")
            query.push({updated_at:{$lt: params.last}});
        else
            query.push({updated_at:{$gt: params.last}});
        }
    if(params.name){
            query.push({name:{$regex : new RegExp(params.name, "i")}});
        }
    if(params.deckId)
            query.push({"deckId": params.deckId});
    Card.find({$and: query }).select("name description imgs ownerName updated_at").sort({updated_at: params.sort}).limit(params.limit).exec(
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

function deleteCard(cardId, userId, callback){
    Card.find({_id:cardId, ownerId: userId, ownerType:"u"}).exec()
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
                             return Promise.resolve();
                         })
                         .then(()=>{
                             return callback({success:true, msg:"Card deleted ok"});
                         })
                         .catch((err)=>{
                            logger.error("err: " +JSON.stringify(err));
                            return callback({success:false, msg:err});
                        });
};

function deleteCardClassInsecure(cardId, classId, callback){
    return Card.findById(cardId).exec()
                        .then(card=>{
                             if(!card)
                                return Promise.reject("Card id does not exist");
                             return imgService.deleteImgsOnce(card.imgs);
                         })
                         .then(()=>{
                            return Card.find({ _id: cardId }).remove().exec();
                         })
                        .then(()=>{
                            return callback({success:true});
                        })
                        .catch(err=>{
                            logger.error("error when deleting card class: " + err);
                            return callback({success:false, msg:err});
                        })
};

function duplicateCardUU(userId, cardIdOld, deckId, callback){
    var card;
    deckService.validateOwnership(userId, deckId)
    .then(()=>{
            return Card.findById(cardIdOld, "name description imgs").exec();
    })
    .then(doc=>{
                if(!doc){
                    logger.error("no card found for cardId: " + cardIdOld + "(trying to duplicate card)");
                    return callback({success:false, msg:"This card does not exist anymore"});
                }
                 card = {
                    name: doc.name,
                    description: doc.description,
                    imgs: doc.imgs,
                    ownerId: userId,
                    deckId: deckId,
                    isDuplicated: true                
                };
                return userService.userCardLimitsOk(userId);
    })
    .then(()=>{
                var cardModel = new Card(card);
                return saveCardUser(cardModel, userId, deckId, callback);
    })
    .then(()=>{
                 return imgService.increaseImgsCounter(card.imgs);
    })
    .then(()=>{
                return callback({success:true});
    })
    .catch(err=>{
                logger.error("duplicateCardUU: " + err);
                return callback({success:false, msg:err});
    });
}

function duplicateCardUCUnsafe(Class, cardIdOld, username, deckId, callback){
        Card.findById(cardIdOld, "name description imgs").exec().then(doc=>{
            if(!doc){
                logger.error("no card found for cardId: " + cardId + "(trying to duplicate card)");
                return callback({success:false, msg:"This card does not exist anymore"});
            }
             var card = {
                name: doc.name,
                description: doc.description,
                imgs: doc.imgs,
                classname: Class.name,
                ownerType: "c",
                ownerName: username,
                ownerId: Class._id
            };
            const cardModel = new Card(card);
            imgService.increaseImgsCounter(card.imgs)
            .then(()=>{
                        return saveCardClass(cardModel, Class._id, deckId);
            })
            .then(results=>{
                        logger.debug(results);
                        return callback({success:true, msg:cardModel});
            })
            .catch(err=>{
                    logger.warn(err);
                    return callback({success:false, msg:err});
            });
        });
}


function updateCard(id, userId, card, callback){
    var Doc;
    Card.findOne({ '_id': id, ownerId: userId, ownerType:"u"}, "name description _id")
    .exec()
    .then(doc=>{
            if(!doc){
                logger.error("no card found for cardId: " + id + ", with and userId: " + userId + "(trying to update card)");
                return callback({success:false, msg:"This card does not exist in the user collection"});
            }
            doc.name = card.name;
            doc.description = card.description;
            Doc = doc;
            return Promise.resolve();
    })
    .then(()=>{
            if(card.deckId){
                    return deckService.findByIdLean(card.deckId, "ownerId ownerType");
            }
            else return Promise.resolve();
    })
    .then(r=>{
            if(r){
                if(r.ownerType !="u" || r.ownerId.toString()  != userId.toString() )
                        return Promise.reject("This deck is not in the class");
                Doc.deckId = card.deckId;
            }
            return Promise.resolve();
    })
    .then(()=>{ 
            Doc.update(Doc, (err, updatedCard)=>{
                    if(err){
                            logger.error(err);
                            return Promise.reject(err);
                        }
                    return callback({success:true});
            });
    })
    .catch(err=>{
                logger.error("error when finding deck: " + err);
                return callback({success:false, msg:err});
    })
}

function updateCardClass(cardId, classId, card){
    //verify if user who made request is in the class
    var Doc;
    return Card.findOne({ '_id': cardId, ownerId: classId, ownerType:"c"}, "name description _id")
    .exec()
    .then(doc=>{
            if(!doc){
                logger.error("no card found for cardId: " + cardId + ", with a classId: " + classId + "(trying to update card)");
                return Promise.reject("This card does not exist in the class collection");
            }
            doc.name = card.name;
            doc.description = card.description;
            Doc = doc;
            return Promise.resolve();
    })
    .then(()=>{
            if(card.deckId){
                return deckService.findByIdLean(card.deckId, "ownerId ownerType");
            }
            else return Promise.resolve();
    })
    .then(r=>{
         if(r){
            if(r.ownerType !="c" || r.ownerId.toString()  != classId.toString() )
                return Promise.reject("This deck is not in the class");
            Doc.deckId = card.deckId;
         }
         return Promise.resolve();
    })
    .then(()=>{ 
            Doc.update(Doc, (err, updatedCard)=>{
                    if(err){
                        logger.error(err);
                        return Promise.reject(err);
                    }
                    return Promise.resolve();
            });
    })
    .catch(err=>{
            logger.error("error when finding deck: " + err);
            return Promise.reject(err);
    })
}

function findByIdLean(cardId, fields){
    return Card.findById(cardId, fields)
    .lean()
    .exec();
}

function findInDeck(deckId, fields, callback){
    Card.find({deckId: deckId}, fields)
    .then(r=>{
        return callback({success:true, cards: r});
    })
    .catch(err=>{
        return callback({success:false, msg:err});
    })
}

function findInDeckLean(deckId, fields){
    return Card.find({deckId: deckId}, fields)
    .lean();
}

module.exports = {
    createUserCard: createUserCard,
    getCards: getCards,
    deleteCard: deleteCard,
    deleteCardClassInsecure: deleteCardClassInsecure,
    duplicateCardUU: duplicateCardUU,
    updateCard: updateCard,
    updateCardClass: updateCardClass,
    returnCards: returnCards,
    getClassCardsUnsafe: getClassCardsUnsafe,
    findByIdLean: findByIdLean,
    findInDeck: findInDeck,
    findInDeckLean: findInDeckLean
}

const classService = require("./class/classService");
const deckService = require("./deckService");

module.exports.duplicateCardUCUnsafe = duplicateCardUCUnsafe;


function saveCardUser(cardModel, userId, deckId){
    return new Promise((resolve, reject)=>{
        cardModel.save().then(()=>{
             userService.decreaseCardCounter(userId)
            .then(()=>{
                resolve();
            })
            .catch(err=>{
                logger.error(err);
                reject(String(err));    
            })
        }, (err)=>{
            logger.error(err);
            reject(String(err));
        });
    });
}

function saveCardClass(cardModel, classId, deckId){
    return new Promise((resolve, reject)=>{
        cardModel.save().then(()=>{
                classService.decreaseCardsLeft(classId)
                .then(()=>{
                    resolve();
                })
                .catch(err=>{
                    logger.error(err);
                    reject(String(err));    
            })
        }, err=>{
            logger.error(err);
            reject(String(err));
        });
    });
}

function createClassCard(parameters, classname, callback){
    parameters.card.deckId = parameters.deckId;
    var cardModel = new Card(parameters.card);
    var user;
    var warning;
    var Class;
    validateCard(cardModel) 
                            .then((result)=>{
                                user = result;
                                return classService.findClassLean(classname, parameters.userId, "_id name cardsLeft");
                            })
                            .then(result=>{
                                if(!result)
                                    return Promise.reject("class not found, user must be in the class");
                                if(result.cardsLeft <= 0)
                                    return Promise.reject("Class cards limit reached");
                                Class = result;
                                return deckService.validateOwnership(Class._id, parameters.deckId);
                            })
                            .then(result=>{
                                return imgService.downloadArray(parameters.imgs, parameters.userId, callback);
                            })
                           .then(r=>{
                                warning = r.warning;
                                cardModel.ownerId = Class._id;
                                cardModel.ownerName = Class.name;
                                cardModel.ownerType = "c";
                                if(r.imgHashes)
                                    cardModel.imgs = r.imgHashes.filter(v=>{
                                        if(objectIsNotEmpty(v))
                                            return true;
                                        return false;
                                    });
                                return saveCardClass(cardModel, Class._id, parameters.deckId);
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

module.exports.createClassCard = createClassCard;