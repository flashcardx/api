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
                               return linkCardUser(userId, cardModel)})
                           .then(()=>{
                               return userService.createCategoryIfNew(userId, cardModel.category);
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

//lastPosition starts from 0
function getCards(userId, params, callback){
    params.limit = parseInt(params.limit);
    if(!params.sort || (params.sort!=="asc" && params.sort!=="desc")){
        logger.error("sort argument invalid(should be asc or desc), got: " + params.sort);
        params.sort= "asc";
    }
    if(params.limit <= 0)
        return callback({success: false, msg: "limit must be > 0"});
    userService.findById(userId, result=>{
          if(result.success === false)
                return callback(result);
          const user = result.msg;
          var query = [{'_id':{ $in: user.cards}}];
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
         Card.find({$and: query }).sort({updated_at: params.sort}).limit(params.limit).exec(
                    (err, cards)=>{
                         return returnCards(err, cards, callback);
                    }
                );
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
    var category;
    userService.deleteCardFromUser(cardId, userId)
                        .then(()=>{
                            return Card.findById(cardId).exec();
                        })
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
                             return deleteCategoryIfEmpty(userId, category);
                         })
                         .then(()=>{
                             return callback({success:true, msg:"Card deleted ok"});
                         })
                         .catch((err)=>{
                            logger.error(err);
                            return callback({success:false, msg:String(err)});
                        });
};

function deleteCategoryIfEmpty(userId, category){
    return new Promise((resolve, reject)=>{
        if(!category)
            return resolve();
        Card.count({ownerId: userId, category: category}).exec().then(c=>{
            if(c > 0)
                return resolve();
            userService.deleteCategory(userId, category).then(()=>{
                return resolve();
            })
            .catch(err=>{
                return reject(err);
            });
        })
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
                var welcomeCard = {
                    name: "Welcome!",
                    description:"We are pleased you are here, hope you enjoy our tool, here are some tips worth to remember: <br/>"+
                                "Your profile is linked with the languaje you choose when you signed up, you can change it in settings.<br/>"+
                                "If you will create cards in other languaje than the one you have selected, please change this setting, otherwise other people could receive non relevant card recommendations.<br/>"+
                                "Feel free to ask us anything, write us to: contact@flashcard-x.com",
                    isDuplicated: true
                 };
                var imgs = [
                    {
                        url:"https://cdn.pixabay.com/photo/2016/11/21/15/38/dock-1846008_640.jpg?attachment",
                        width: 640,
                        height: 400
                    }
                ]
                return createCard(welcomeCard, imgs, userId, callback);
}

function updateCard(id, userId, card, callback){
    Card.findOne({ '_id': id, 'ownerId': userId }).exec().then(doc=>{
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
    deleteCategoryIfEmpty(userId, deletedCategory)
        .then(()=>{
            return userService.createCategoryIfNew(userId, newCategory);
        })
        .then(()=>{
            return callback();
        })
        .catch(err=>{
            return callback(err);
        })
}


module.exports = {
    createCard: createCard,
    getCards: getCards,
    getAllCards: getAllCards,
    deleteCard: deleteCard,
    cardRecommendations: cardRecommendations,
    duplicateCard: duplicateCard,
    setInitialCards: setInitialCards,
    updateCard: updateCard
}