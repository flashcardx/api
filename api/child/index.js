var fork = require('child_process').fork;
var deleteDeck = fork('child/deleteDeck.js');

console.log("starting child processes");


deleteDeck.on('exit', function (code, signal) {
  console.log('child process deleteDeck exited with ' +
              `code ${code} and signal ${signal}`);
});

deleteDeck.on('message', msg=>{
  console.log('Message from child deleteDeck: ', msg);
});

function deleteDeckSubP(deckId){
    deleteDeck.send({deckId: deckId});
}

module.exports = {
    deleteDeckSubP: deleteDeckSubP
}