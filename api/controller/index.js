const setupController = require("./setupController");
const loginController = require("./loginController");
const searchController = require("./searchController");
const cardController = require("./cardController");
const imgController = require("./imgController");
const preferencesController = require("./preferencesController");
const userController = require("./userController");
const deckController = require("./deckController");
const practiceController = require("./practiceController");
const notificationController = require("./notificationController");

module.exports = function(app){
    setupController(app);
    loginController(app);
    searchController(app);
    cardController(app);
    imgController(app);
    preferencesController(app);
    userController(app);
    deckController(app);
    practiceController(app);
    notificationController(app);
};