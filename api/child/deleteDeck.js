var appRoot = require("app-root-path");
const Deck = require(appRoot + "/models/deckModel");
const cardService = require(appRoot + "/service/cardService");

console.log("deleteDeck child process ready!");

process.on('message', msg=>{
  console.error("msg: " + JSON.stringify(msg));
  if(msg.deckId)
      deleteDeck(msg.deckId);
  else
      console.log('child process: delete deck got message without deckid');
});


function deleteDeck(deckId){
  console.error("child will delete : " + deckId);
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
     console.log("deleteDeck child process failed, deckId: " + deckId +", err: " + err);
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
      console.log("invalid deck owner type: " + deck.ownerType + " deckid: " + deck._id);  
}