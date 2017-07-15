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
const categoryService = require("./categoryService");

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


function createCard(card, imgs, userId, callback){
    var cardModel = new Card(card);
    var user;
    validateCard(cardModel)
                            .then(()=>{
                                return userService.userCardLimitsOk(userId);
                            })
                            .then((result)=>{
                                user = result;
                                return imgService.downloadArray(imgs, userId, callback);
                            })
                           .then(imgHashes=>{
                                cardModel.ownerId = user._id;
                                cardModel.ownerName = user.name;
                                cardModel.lang = user.lang;
                                cardModel.imgs = imgHashes;
                                return saveCard(cardModel);
                           })
                           .then(()=>{
                               return categoryService.createCategoryIfNew(userId, user.lang, cardModel.category);
                           })
                           .then(()=>{
                                return userService.decreaseCardCounter(user);
                            })
                           .then(results=>{
                                    logger.debug(results);
                                    return callback({success:true, msg:"card was created ok!"});
                                })
                            .catch(msg=>{
                                 logger.info(msg);
                                 return callback({success:false, msg:msg});
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
          if(params.category !== undefined)
            query.push({category:params.category});
       Card.find({$and: query }).select("name description imgs category lang ownerName updated_at").sort({updated_at: params.sort}).limit(params.limit).exec(
                    (err, cards)=>{
                         return returnCards(err, cards, callback);
                    }
                );
        })
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
    var category;
    Card.findById(cardId).exec()
                        .then(card=>{
                             if(!card)
                                throw new Error("Card id does not exist");
                             category = card.category;
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
                                if(r.success === false){
                                    logger.error(r.msg);
                                    return callback(r);
                                }
                                const lang = r.msg;
                             return deleteCategoryIfEmpty(userId, lang, category);
                             });
                         })
                         .then(()=>{
                             return callback({success:true, msg:"Card deleted ok"});
                         })
                         .catch((err)=>{
                            logger.error(err);
                            return callback({success:false, msg:String(err)});
                        });
};

function deleteCategoryIfEmpty(userId, lang, category){
    return new Promise((resolve, reject)=>{
        if(!category)
            return resolve();
        Card.count({ownerId: userId, category: category, lang: lang}).exec().then(c=>{
            if(c > 0)
                return resolve();
            categoryService.deleteCategory(userId, category).then(()=>{
                return resolve();
            })
            .catch(err=>{
                return reject(err);
            });
        })
    });
};

function duplicateCard(userId, cardIdOld, callback){
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
            createDuplicatedCard(card, userId, callback);
        });
}

function createDuplicatedCard(card, userId, callback){
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
                        return duplicateCard(userId, doc, callback);
                    });
            })
}

function updateCard(id, userId, card, callback){
    Card.findOne({ '_id': id}, "name description category _id").exec().then(doc=>{
            if(!doc){
                logger.error("no card found for cardId: " + id + ", with and userId: " + userId + "(trying to update card)");
                return callback({success:false, msg:"This card does not exist in the user collection"});
            }
            const oldCategory = doc.category;
            doc.name = card.name;
            doc.description = card.description;
            doc.category = card.category;
            doc.update(doc, (err, updatedCard)=>{
                if(err){
                    logger.error(err);
                    return callback({success:false, msg: String(err)});
                }
                updateCategorys(userId, oldCategory, card.category, err=>{
                if(err){
                    logger.error(err);
                    return callback({success:false, msg: String(err)});
                }
                    return callback({success:true, msg: updatedCard});
                })
            });
    });
}

function updateCategorys(userId, deletedCategory, newCategory, callback){
    userService.getUserLang(userId, r=>{
        if(r.success === false){
            logger.error(r.msg);
            return callback(r);
        }
        const lang = r.msg;
        deleteCategoryIfEmpty(userId, lang, deletedCategory)
            .then(()=>{
                return categoryService.createCategoryIfNew(userId, lang, newCategory);
            })
            .then(()=>{
                return callback();
            })
            .catch(err=>{
                return callback(err);
            })
    });
}


module.exports = {
    createCard: createCard,
    getCards: getCards,
    getAllCards: getAllCards,
    deleteCard: deleteCard,
    cardRecommendations: cardRecommendations,
    duplicateCard: duplicateCard,
    setInitialCards: setInitialCards,
    updateCard: updateCard,
    returnCards: returnCards
}