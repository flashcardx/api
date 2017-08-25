const setupController = require("./setupController");
const loginController = require("./loginController");
const searchController = require("./searchController");
const cardController = require("./cardController");
const imgController = require("./imgController");
const preferencesController = require("./preferencesController");
const userController = require("./userController");
const classController = require("./classController");
const deckController = require("./deckController");

module.exports = function(app){
    setupController(app);
    loginController(app);
    searchController(app);
    cardController(app);
    imgController(app);
    preferencesController(app);
    userController(app);
    classController(app);
    deckController(app);
};