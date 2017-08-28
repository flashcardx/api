var appRoot = require("app-root-path");
const Deck = require(appRoot + "/models/deckModel").deck;
const cardService = require(appRoot + "/service/cardService");
const config = require(appRoot + "/config");
const mongoose = require("mongoose");

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
   Deck.findOne({_id:deckId}, "decks cards ownerType ownerId", (err, deck)=>{
        if(err)
            return console.error("deleteDeck child process failed, deckId: " + deckId +", err: " + err)
        if(!deck)
            return console.error("deck not found");
        deck.decks.forEach(d=>{
            deleteDeck(d);
        })
        deleteCards(deck);
        deck.remove();
   })
}

function deleteCards(deck){
  if(deck.ownerType == "u")
        deck.cards.forEach(c=>{
            cardService.deleteCard(c, deck.ownerId);
        });
  else if(deck.ownerType == "c")
        deck.cards.forEach(c=>{
            cardService.deleteCardClassInsecure(c, deck._id);
        });
  else 
      console.log("invalid deck owner type: " + deck.ownerType + " deckid: " + deck._id);  
}