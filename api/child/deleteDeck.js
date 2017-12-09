var appRoot = require("app-root-path");
const Deck = require(appRoot + "/models/deckModel").deck;
const cardService = require(appRoot + "/service/cardService");
const imgService = require(appRoot + "/service/imgService");
const config = require(appRoot + "/config");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const logger = config.getLogger(__filename);

logger.info("deleteDeck child process ready!");
config.connectMongoose();

process.on('message', msg=>{
  if(msg.deckId)
      deleteDeck(msg.deckId);
  else
      console.log('child process: delete deck got message without deckid');
});

function deleteDeck(deckId){
   logger.info("child process about to delete deck: ", deckId);
   Deck.findOne({_id:deckId}, "decks img ownerType ownerId")
   .then(deck=>{
        if(!deck)
            return Promise.reject("deck not found");
        deleteCards(deck);
        deleteFromFeed(deck.ownerType, deckId, deck.ownerId);
        deck.remove();
        imgService.deleteImgOnce(deck.img.hash, r=>{
            if(r.success == false)
                logger.fatal("error in child delete deck when deleting img of deck: ", r.msg);
        });
        return  Deck.find({parentId:deckId}, "_id")
                .lean()
                .exec(); 
    })
    .then(decks=>{
            decks.forEach(deck=>{
                deleteDeck(deck._id);
            })
    })
    .catch(err=>{
        logger.fatal("Error in child process when trying to delete deck: ", err);
    });
}

function deleteCards(deck){
  if(deck.ownerType == "u")
        cardService.findInDeck(deck._id, "_id", r=>{
            if(r.success == true)
                r.cards.forEach(c=>{
                    cardService.deleteCard(c, deck.ownerId,r=>{
                        if(r.success == false)
                            logger.fatal("error when deleting card: " + r.msg)
                    });
                });
            else
                logger.fatal("cards in deck will not be deleted since got error: " + r.msg);
        })
  else if(deck.ownerType == "c")
        cardService.findInDeck(deck._id,"_id", r=>{
            if(r.success == true)
                r.cards.forEach(c=>{
                    /*This method is unsafe however we use it since the module who calls this is supposed to do the validations*/ 
                    cardService.deleteCardClassInsecure(c, deck._id, r=>{
                        if(r.success == false)
                            logger.fatal("error when deleting card: " + r.msg)
                    });
                });
            else
                logger.fatal("cards in deck will not be deleted since got error: " + r.msg);
        })
  else 
      logger.fatal("invalid deck owner type: " + deck.ownerType + " deckid: " + deck._id);  
}

function deleteFromFeed(ownerType, deckId, ownerId){
    if(ownerType == "c")
        feedService.removeDeckFromClass(ownerId, deckId);
}