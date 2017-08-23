const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const Deck = require(appRoot + "/models/deckModel");
const cardService = require(appRoot + "/service/cardService");

logger.info("deleteDeck child process ready!");

process.on('message', (msg) => {
  if(msg.deckId)
    deleteDeck(msg.deckId);
  else
    logger.error('child process: delete deck got message without deckid');
});


function deleteDeck(deckId){
   Deck.findOne({_id:deckId}, "decks cards ownerType ownerId")
   .then(deck=>{
      if(!deck)
        return Promise.reject("deck not found");
      deck.decks.forEach(d=>{
          deleteDeck(d);
      })
      deleteCards(deck);
      deck.remove();
   })
   .catch(err=>{
     logger.fatal("deleteDeck child process failed, deckId: " + deckId +", err: " + err);
   })
}

function deleteCards(deck){
  if(deck.ownerType == "u")
        deck.cards.forEach(c=>{
            cardService.deleteCard(c, deck.ownerId);
        });
  else if(deck.ownerType == "c")
        deck.cards.forEach(c=>{
            cardService.deleteCardClass(c, deck._id);
        });
  else 
      logger.fatal("invalid deck owner type: " + deck.ownerType + " deckid: " + deck._id);
      
}