var appRoot = require("app-root-path");
const Deck = require(appRoot + "/models/deckModel").deck;
const deckModel = require(appRoot + "/models/deckModel").DEFAULT_RECURSIVE_ORDER;
const cardService = require(appRoot + "/service/cardService");
const classService = require(appRoot + "/service/class/classService");
const imgService = require(appRoot + "/service/imgService");
const userService = require(appRoot + "/service/userService");
const deckService = require(appRoot + "/service/deckService");
const notificationService = require(appRoot + "/service/notificationService");
const feedService = require(appRoot + "/service/feedService");
const config = require(appRoot + "/config");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const logger = config.getLogger(__filename);

logger.info("duplicate Deck child process ready!");
config.connectMongoose();
process.on('message', msg=>{
  switch (msg.mode) {
      case "2u": duplicate("u", msg.userId, msg.srcId, msg.destId, msg.userId);
                break;
      case "2c": duplicate("c", msg.classId, msg.srcId, msg.destId, msg.userId);
                break;
      default: logger.fatal("duplicate card subprocess got invalid mode: " + msg.mode);
          break;
  }
});


function duplicate(ownerType, ownerId, srcId, destId, userId){
    var deckBackup;
    var newDeckModel;
    Deck.findOne({_id:srcId, active:true})
    .lean()
    .exec()
    .then(deck=>{
        if(!deck)
            return Promise.reject("deck not found");
        deckBackup = deck;
        return makeDeck(deck, ownerType, ownerId, destId, userId);
   }) 
    .then(d=>{
        newDeckModel = new Deck(d);
        return imgService.increaseImgsCounter([{hash:deckBackup.thumbnail}])
    })
    .then(()=>{
            newDeckModel.save(err=>{
                if(err)
                    return Promise.reject("Could not save new deck when duplicating, therebefore duplication cant continue, err: " + err);
                if(destId){
                    return Deck.update({_id:destId}, {"$push":{"decks":newDeckModel._id}})
                    .exec();
                }
                else
                    return Promise.resolve();
        })
    .then(r=>{
                if(ownerType =="c")
                     publish2feed(ownerType, newDeckModel._id, userId, ownerId);
                if(r && r.nModified == 0)
                    return Promise.reject("could not push:" + newDeckModel._id + " to deck: " + destId);
                deckBackup.decks.forEach(d=>{
                    duplicate(ownerType, ownerId, d, newDeckModel._id, userId);
                })
                if(ownerType =="u")
                    duplicateCards2User(ownerId, srcId, newDeckModel._id);
                else if(ownerType =="c")
                    duplicateCards2Class(userId, ownerId, srcId, newDeckModel._id);
            });
    })
    .catch(err=>{
          logger.fatal("duplicateDeck child process failed, deckId: " + srcId +", err: " + err)
    })
}

function duplicateCards2User(userId, srcDeckId, destDeckId){
    cardService.findInDeckLean(srcDeckId, "_id")
    .then(cards=>{
            cards.forEach(c=>{
                    cardService.duplicateCard2User(userId, c._id, destDeckId, r=>{
                        if(r.success == false)
                            logger.fatal("error when duplicating card to user"+ r.msg);
                    });
                });
    })
    .catch(err=>{
        logger.fatal("error when duplicating cards from deck 2 user: " + err);
    })
}

function duplicateCards2Class(userId, ownerId, srcDeckId, destDeckId){
    cardService.findInDeckLean(srcDeckId, "_id")
    .then(cards=>{
                classService.findByIdLeanUnsafe(ownerId)
                .then(Class=>{
                        if(!Class)
                            return logger.fatal("class not found when duplicating cards to class");
                        else
                            userService.findByIdLean(userId, "name", r=>{
                                if(r.success == false){
                                    return Promise.reject(r.msg);
                                }
                                const username = r.msg.name;
                                  cards.forEach(c=>{
                                        cardService.duplicateCardUCUnsafe(Class, c._id, username, destDeckId, r=>{
                                            if(r.success == false)
                                                logger.fatal("error when duplicating card to class: "+ r.msg);
                                        });
                                  });
                            })
                })
                .catch(err=>{
                    logger.fatal("error when findinf class for duplicating card 2 class: " + err);
                })
    })
    .catch(err=>{
        logger.fatal("error when duplicating cards from deck to class: " + err);
    })
}

function makeDeck(deck, ownerType, ownerId, destId, userId){
    return new Promise((resolve, reject)=>{
        if(!destId){
            var r = parseDeck(deck, ownerType, ownerId, deckModel.DEFAULT_RECURSIVE_ORDER);
            return resolve(r);
        } 
        deckService.findByIdLean(destId, "recursiveOrder")
        .then(r=>{
            if(!r)
                return Promise.reject("deck not found");
            if(r.recursiveOrder <= 0){
                notificationService.notifyUser("Could not finish deck duplication, deck too deep(to manny decks inside each other)", userId);
                return Promise.reject("Destiny deck recusive order <= 0");
            }
            return Promise.resolve(r.recursiveOrder);
        })
        .then(recursiveOrder=>{
            var r = parseDeck(deck, ownerType, ownerId, recursiveOrder-1);
            return resolve(r);
        })
        .catch(err=>{
            return reject(err);
        })
    });
}

function parseDeck(deck, ownerType, ownerId, recursiveOrder){
    return {ownerType: ownerType,
                        ownerId: ownerId,
                        decks: deck.decks,
                        name: deck.name,
                        description: deck.description,
                        thumbnail: deck.thumbnail,
                        recursiveOrder: recursiveOrder,
                        lang: deck.lang
                    };
}

function publish2feed(ownerType, deckId, userId, classId){
    userService.findByIdLeanPromise(userId, "name")
    .then(user=>{
        if(!user)
            return Promise.reject("user not found");
        if(ownerType == "c"){
            classService.findByIdLeanUnsafe(classId, "name")
            .then(Class=>{
                if(!Class)
                    return Promise.reject("class not found");
                feedService.publishDeckClassFeed(deckId, classId, Class.name, userId, user.name);
            })
            .catch(err=>{
                return Promise.reject(err);
            })
        }
    })
    .catch(err=>{
        logger.fatal("Error when getting user for publishing to feed: " + err);
    });
}