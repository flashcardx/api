const setupController = require("./setupController");
const loginController = require("./loginController");
const searchController = require("./searchController");
const cardController = require("./cardController");
const imgController = require("./imgController");
const preferencesController = require("./preferencesController");

module.exports = function(app){

    setupController(app);
    loginController(app);
    searchController(app);
    cardController(app);
    imgController(app);
    preferencesController(app);
};