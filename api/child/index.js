var appRoot = require("app-root-path");
const config = require(appRoot + "/config");
var fork = require('child_process').fork;
var deleteDeck = fork('child/deleteDeck.js');
var duplicateDeck = fork('child/duplicateDeck.js');
const logger = config.getLogger(__filename);

console.log("starting child processes");


deleteDeck.on('exit', function (code, signal) {
  logger.fatal('child process deletedeck exited with ' +
              `code ${code} and signal ${signal}`);
});
deleteDeck.on('message', msg=>{
  logger.error('Message from child deletedeck: ', msg);
});
duplicateDeck.on('exit', function (code, signal) {
  logger.fatal('child process duplicateDeck exited with ' +
              `code ${code} and signal ${signal}`);
});
duplicateDeck.on('message', msg=>{
  logger.error('Message from child duplicateDeck: ', msg);
});

function deleteDeckSubP(deckId){
    deleteDeck.send({deckId: deckId});
}

function duplicateDeck2USubP(userId, srcId, destId){
    duplicateDeck.send({mode: "2u", userId:userId, srcId: srcId, destId: destId});
}

function duplicateDeck2CSubP(userId, classId, srcId, destId){
    duplicateDeck.send({mode: "2c", userId: userId, classId:classId, srcId: srcId, destId: destId});
}


module.exports = {
    deleteDeckSubP: deleteDeckSubP,
    duplicateDeck2USubP: duplicateDeck2USubP,
    duplicateDeck2CSubP: duplicateDeck2CSubP
}