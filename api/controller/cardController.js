const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const Cards = require(appRoot + "/models/cardModel");
const cardService = require(appRoot + "/service/cardService");


module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.post("/card", controllerUtils.requireLogin, function(req, res){
            var card = {
                name: req.body.name,
                description: req.body.description,
            };
            cardService.createCard(card, req.body.urls, req.userId,function(result){
                res.json(result);
            });
    } );

    app.get("/myCards", controllerUtils.requireLogin, function(req, res){
        cardService.getCards(req.userId, function(result){
            res.json(result);
        });
    });

    app.get("/allCards" , function(req, res){
        var lastId = req.query.lastId;
        cardService.getAllCards(lastId, function(result){
            res.json(result);
        });
    });

    app.get("/discoverCards", controllerUtils.requireLogin, function(req, res){
        var lastId = req.query.lastId;
        cardService.cardRecommendations(req.userId, lastId ,result=>{
            res.json(result);
        });
    });
  
    app.delete("/card/:id", controllerUtils.requireLogin, (req, res)=>{
        const id = req.params.id;
        cardService.deleteCard(id, req.userId, function(result){
            res.json(result);
        });
    });

};