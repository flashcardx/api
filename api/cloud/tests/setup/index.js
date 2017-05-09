const mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
const db = require("./testDb.json");
const seed = require("./testSeed.json");
const Cards = require("../../models/cardModel");
const Users = require("../../models/userModel");

function connect(){
        mongoose.connect(`mongodb://${db.host}:${db.port}/${db.name}`);
};

function setup(){
        connect();
        Cards.remove({}).then(createCards)
                        .then(deleteUsers)
                        .then(createUsers)
                        .then(finish);   
};

function createCards(result){
        return Cards.create(seed.cards);
};

function deleteUsers(results){
        console.log("cards were created ok");
        return Users.remove({});
};

function createUsers(result){
        return Users.create(seed.users);
};

function finish(results){
        console.log("users were created ok");
}

module.exports = setup;