const request = require('supertest');
const appRoot = require('app-root-path');
const User = require(appRoot + "/models/userModel");
const Code = require(appRoot + "/models/codeModel");
const loginUtil = require(appRoot + "/controller/loginUtil");
const mongoose = require("mongoose");
const Deck = require(appRoot + "/models/deckModel").deck;

//if promise resolves returns access token for the user
function setupBasicUserAndDeck(){
    const CODE= "0123456789";
    var token,
        userId,
        deckId;

    return new Promise((resolve, reject)=>{
        dropDatabase()
        .then(()=>{
            var user = {name:"tester", password:"1234", "plan.cardsLeft":200};
            var userModel = new User(user);
            userId = userModel._id;
            return userModel.save()
        })
        .then(()=>{
            var code = {hash:CODE, months:1, owner: userId, end:new Date().setDate(new Date().getDate() + 10)};
            var codeModel = new Code(code);
            return codeModel.save();
        })
        .then(()=>{
            var deck = {name:"MY DECK", description:"abc", ownerId: userId};
            var deckModel = new Deck(deck);
            deckId = deckModel._id;
            return deckModel.save();
        })
        .then(()=>{
            loginUtil.issueToken(userId, r=>{
                if(r.success)
                    resolve({token: r.token, deckId: deckId});
                else
                    reject(r.msg)
            });
        })
        .catch(err=>{
            console.error("err", err);
            reject(err);
        });
    })
}
    
function dropDatabase(){
    return new Promise((resolve, reject)=>{
        if(mongoose.connection.readyState == 1){
            mongoose.connection.db.dropDatabase();
            return resolve();
        }
        else
            mongoose.connection.once('connected', ()=>{
                mongoose.connection.db.dropDatabase();
                return resolve();
            });
    });
};


module.exports = {
    setupBasicUserAndDeck: setupBasicUserAndDeck
}