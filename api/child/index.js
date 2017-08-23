const appRoot = require('app-root-path');
var fork = require('child_process').fork;
const config = require(appRoot + "/config");
const purifier = require(appRoot + "/utils/purifier");
const logger = config.getLogger(__filename);

logger.info("starting child processes");
var deleteDeck = fork('child/deleteDeck.js');

deleteDeck.on('exit', function (code, signal) {
  logger.error('child process deleteDeck exited with ' +
              `code ${code} and signal ${signal}`);
});


deleteDeck.on('message', msg=> {
  logger.info('Message from child deleteDeck: ', msg);
});

function deleteDeckSubP(deckId){
    deleteDeck.send({deckId: deckId});
}


module.exports = {
    deleteDeckSubP: deleteDeckSubP
}