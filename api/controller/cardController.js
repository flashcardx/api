const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const controllerUtils = require("./utils");
const logger = config.getLogger(__filename);
const Cards = require(appRoot + "/models/cardModel");
const cardService = require(appRoot + "/service/cardService");


module.exports = function(app){

    app.post("/card", controllerUtils.requireLogin, function(req, res){
            var card = {
                name: req.body.name,
                description: req.body.description,
            };
            cardService.createCard(card, req.body.urls, req.user._id,function(result){
                res.json(result);
            });
    } );

    app.get("/myCards", controllerUtils.requireLogin, function(req, res){
        cardService.getCards(req.user._id, function(result){
            res.json(result);
        });
    });

    app.get("/allCards" , function(req, res){
        cardService.getAllCards(function(result){
            res.json(result);
        });
    });
    
    //todo: verify that user ows that card before deleting it
    app.delete("/card/:id", controllerUtils.requireLogin, (req, res)=>{
        const id = req.params.id;
        cardService.deleteCard(id, req.user._id, function(result){
            res.json(result);
        });
    });

};