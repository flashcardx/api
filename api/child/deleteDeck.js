var appRoot = require("app-root-path");
const Deck = require(appRoot + "/models/deckModel").deck;
const cardService = require(appRoot + "/service/cardService");
const config = require(appRoot + "/config");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const logger = config.getLogger(__filename);

console.log("deleteDeck child process ready!");
mongoose.connect(config.getDbConnectionString(),  {server:{auto_reconnect:true}});

mongoose.connection.on('disconnected', function () {  
  logger.warn('Mongoose default connection disconnected(child process)'); 
  mongoose.connect(config.getDbConnectionString(),  {server:{auto_reconnect:true}});
});

process.on('message', msg=>{
  if(msg.deckId)
      deleteDeck(msg.deckId);
  else
      console.log('child process: delete deck got message without deckid');
});

function deleteDeck(deckId){
   Deck.findOne({_id:deckId, active:true}, "decks ownerType ownerId", (err, deck)=>{
        if(err)
            return console.error("deleteDeck child process failed, deckId: " + deckId +", err: " + err)
        if(!deck)
            return console.error("deck not found");
        deck.decks.forEach(d=>{
            deleteDeck(d);
        })
        deleteCards(deck);
        deleteFromFeed(deck.ownerType, deckId, deck.ownerId);
        deck.remove();
   })
}

function deleteCards(deck){
    logger.error("deletecards, deck: " + JSON.stringify(deck));
  if(deck.ownerType == "u")
        cardService.findInDeck(deck._id, "_id", r=>{
            logger.error("delete cards got: " + JSON.stringify(r));
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