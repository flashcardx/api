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
    validateCard(cardModel).then(()=>{
                                return imgService.downloadArray(urls, userId, callback)})
                           .then(imgIds=>{
                                cardModel.imgs = imgIds;
                                return saveCard(cardModel);
                           })
                           .then(()=>{
                               return linkCardUser(userId, cardModel)})
                           .then(results=>{
                                    logger.debug(results);
                                    return callback({success:true, msg:"card was created ok!"});
                                })
                            .catch(jsonMsj=>{
                                 logger.error(jsonMsj);
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
    User.findById(userId).exec().then((user)=>{
            if(!user)
                return callback({success:false, msg:"User does not exist"});
            if(user.cards.length === 0)
                return callback({success:true, msg:[]});
          var cardsId = user.cards;
          var results = [];
          cardsId.forEach((cardId, index)=>{
            Card.findById(cardId).exec().then((card)=>{
                results.push(card);
                if(index === cardsId.length - 1)
                    return callback({success:true, msg:results});
             });
            });
        }).catch((err)=>{
           logger.error(String(err));
           callback({success:false, msg:String(err)});
        });
};

function getAllCards(callback){
    Card.find({}, (err, cards)=>{
        if(err){
            logger.error(err);
            return callback({success:false, msg:String(err)});
        }
        return callback({success:true, msg:cards});
    });
};

function deleteCard(cardId, userId, callback){
    userService.deleteCardFromUser(cardId, userId)
                        .then(()=>{
                            return Card.findById(cardId).exec();
                        })
                        .then(card=>{
                             if(!card)
                                throw new Error("Card id does not exist");
                             const imgsId = card.imgs
                             return imgService.deleteImgsOnce(imgsId);
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
    deleteCard: deleteCard
}