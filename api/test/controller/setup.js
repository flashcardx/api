const request = require('supertest');
const appRoot = require('app-root-path');
const User = require(appRoot + "/models/userModel");
const Code = require(appRoot + "/models/codeModel");
const loginUtil = require(appRoot + "/controller/loginUtil");
const mongoose = require("mongoose");

//if promise resolves returns access token for the user
function setupBasicUser(){
    const CODE= "0123456789";
    var token,
        userId
    return new Promise((resolve, reject)=>{
        dropDatabase()
        .then(()=>{
            var user = {name:"tester", password:"1234", "plan.cardsLeft":200};
            var userModel = new User(user);
            userId = userModel._id;
            return userModel.save()
        })
        .then(()=>{
            var code = {hash:CODE, months:1, owner: userId};
            var codeModel = new Code(code);
            return codeModel.save();
        })
        .then(()=>{
            loginUtil.issueToken(userId, r=>{
                resolve(r);
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
    setupBasicUser: setupBasicUser
}