var appRoot = require("app-root-path");
const Deck = require(appRoot + "/models/deckModel").deck;
const cardService = require(appRoot + "/service/cardService");
const classService = require(appRoot + "/service/class/classService");
const imgService = require(appRoot + "/service/imgService");
const userService = require(appRoot + "/service/userService");
const config = require(appRoot + "/config");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const logger = config.getLogger(__filename);

console.log("duplicate Deck child process ready!");
mongoose.connect(config.getDbConnectionString(),  {server:{auto_reconnect:true}});

mongoose.connection.on('disconnected', function () {  
  logger.warn('Mongoose default connection disconnected(child process)'); 
  mongoose.connect(config.getDbConnectionString(),  {server:{auto_reconnect:true}});
});

process.on('message', msg=>{
  switch (msg.mode) {
      case "2u": duplicate("u", msg.userId, msg.srcId, msg.destId);
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
        //WHAT HAPPENS IF DECKID=UNDEFINED?
        return parsedeck(deck, ownerType, ownerId, destId);
   }) 
    .then(d=>{
        deckBackup = deck;
        newDeckModel = new Deck(d);
        return imgService.increaseImgsCounter([{hash:deck.thumbnail}])
    })
    .then(()=>{
            newDeckModel.save(err=>{
                if(err)
                    return logger.fatal("Could not save new deck when duplicating, therebefore duplication cant continue, err: " + err);
                if(destId)
                    return Deck.update({_id:destId}, {$push:{"decks":newDeckModel._id}});
                else
                    return Promise.resolve();
        })
    .then(()=>{
                deckBackup.decks.forEach(d=>{
                    duplicate(ownerType, ownerId, srcId, newDeckModel._id);
                })
                if(ownerType =="u")
                    duplicateCards2User(ownerId, srcId, newDeckModel._id);
                else if(ownerType =="c")
                    duplicateCards2Class(userId, ownerId, srcId, newDeckModel._id);
            });
    })
    .catch(err=>{
          logger.fatal("deleteDeck child process failed, deckId: " + srcId +", err: " + err)
    })
}

function duplicateCards2User(userId, srcDeckId, destDeckId){
    cardService.findInDeckLean(srcDeckId, "_id")
    .then(cards=>{
            cards.forEach(c=>{
                    cardService.duplicateCardUU(userId, c._id, destDeckId, r=>{
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
                        if(r.success == false)
                            return logger.fatal("error when grtting user name for duplicating deck to class: " + err);
                        const username = r.msg.name;
                        cardService.duplicateCardUCUnsafe(Class, c._id, username, destDeckId, r=>{
                            if(r.success == false)
                                logger.fatal("error when duplicating card to class: "+ r.msg);
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

function parsedeck(deck, ownerType, ownerId, destId){
    return new Pomisie((resolve, reject)=>{
        deckService.findByIdLean(destId, "recursiveOrder")
        .then(r=>{
            if(!r)
                return reject("deck not found");
            if(r.recursiveOrder == 0)
                return reject("");
            var r = {ownerType: ownerType,
                        ownerId: ownerId,
                        decks: deck.decks,
                        name: deck.name,
                        description: deck.description,
                        thumbnail: deck.thumbnail,
                        recursiveOrder: r.recursiveOrder - 1,
                        lang: deck.lang
                    };
            return resolve(r);
        })
        .catch(err=>{
            return reject(err);
        })
    });
}