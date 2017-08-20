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
const classService = require("./class/classService");

function create4User(userId, deck, callback){
    deck.ownerType = "u";
    deck.ownerId = userId;
    var deckModel = new Deck(deck);
    if(deck.parentid)
        createChildDeck(deckModel, deck.parentid, callback);
    else
        saveDeck(deckModel, callback);
}

function create4Class(userId, classname, deck, callback){
    classService.findClassLean(classname, userId, "_id")//verifies user is in class
    .then(Class=>{
        if(!Class){
            logger.error("class not found");
            return callback({success:false, msg:"Class not found(user must be in the class)"});
        }
        deck.ownerType = "c";
        deck.ownerId = Class._id;
        var deckModel = new Deck(deck);
        if(deck.parentid)
            createChildDeck(deckModel, deck.parentid, callback);
        else
            saveDeck(deckModel, callback);
    })
    .catch(err=>{
        logger.error("when creating deck4class: " + err);
        return callback({success:false, msg:err});
    });
}

function createChildDeck(deckModel, parentid, callback){
    if(deckModel._id == parentid){
        logger.error("can not create recursive deck");
        return callback({success:false, msg:"can not create recursive deck"});
    }
    Deck.update({_id: parentid, ownerId:deckModel.ownerid}, {"$push":{"decks":deckModel._id}})
    .then(r=>{
        if(r.nModified == 0)
            return callback({success:false, msg:"could not find parent deck, parent and child deck must have same ownerid"});
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
            return callback({success: true, id:deckModel._id});
        })
}

//set thumbnail
//remove thumbnail
//edit name
//edit description
//delete deck: deletes ownerid in all subddecks and increases owner limits
//adds parent to redis deletion queue 

module.exports = {
    create4User: create4User,
    create4Class: create4Class
}