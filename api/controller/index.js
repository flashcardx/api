const setupController = require("./setupController");
const loginController = require("./loginController");

module.exports = function(app){

    setupController(app);
    loginController(app);
    
};