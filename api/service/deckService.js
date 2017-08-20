const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const Deck = require(appRoot + "/models/deckModel");
const Deckduplication = require(appRoot + "/models/deckduplicationModel");
const imgService = require("./imgService");
const userService = require("./userService");
const logger = config.getLogger(__filename);
const mongoose = require("mongoose");
const AWSService = require("./AWSService");
const categoryService = require("./categoryService");

//get parent deck id
function create4User(userId, deck, callback){
    deck.ownerType = "u";
    deck.ownerId = userId;
    var deckModel = new Deck(deck);
    if(deck.parentid)
        createChildDeck(deckModel, deck.parentid, callback);
    else
        saveDeck(deckModel, callback);
}

function createChildDeck(deckModel, parentid, callback){
    if(deckModel._id == parentid){
        logger.error("can not create recursive deck");
        return callback({success:false, msg:"can not create recursive deck"});
    }
    Deck.update({_id: parentid}, {"$push":{"decks":deckModel._id}})
    .then(r=>{
        saveDeck(deckModel, callback);
    })
    .catch(err=>{
        logger.error("trying to push deck id in parent: " + err);
        return callback({success:false, msg:err});
    })
}

function saveDeck(deckModel, callback){
    deckModel.save(err=>{
            if(err){
                logger.error("error when  creating deck: " + err);
                return callback({success:false, msg:err});
            }
            return callback({success: true});
        })
}

module.exports = {
    create4User: create4User
}