const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const controllerUtils = require("./utils");
const logger = config.getLogger(__filename);
const Img = require(appRoot + "/models/imgModel");
const classService = require(appRoot + "/service/classService");
const notificationService = require(appRoot + "/service/notificationService");

module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.post("/class",  controllerUtils.requireLogin, function(req, res){
        var Class = {
            owner:{
                id: req.userId
            },
            name: req.body.name,
            description: req.body.description,
            isPrivate: req.body.isPrivate
        }
        classService.create(Class, r=>{
            return res.json(r);
        });
    });

    app.get("/classes", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        classService.listAll(userId, r=>{
            return res.json(r);
        });
    });

    app.get("/classesShort", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        classService.listAllShort(userId, r=>{
            return res.json(r);
        });
    });

    app.get("/searchClass/:name",  controllerUtils.requireLogin, function(req, res){
        var classname = req.params.name;
        classService.search(classname, req.userId, r=>{
            return res.json(r);
        });
    });

    app.get("/recommendClasses",  controllerUtils.requireLogin, function(req, res){
        classService.recommendClasses(req.userId, r=>{
            return res.json(r);
        });
    });

    app.get("/joinClass/:classname",  controllerUtils.requireLogin, function(req, res){
        const classname = req.params.classname;
        classService.joinClass(classname, req.userId, r=>{
            return res.json(r);
        });
    });


    //if manny users to add, call this endpoint for each user
    app.post("/addUserToClass",  controllerUtils.requireLogin, function(req, res){
        var joinerEmail = req.body.userEmail;
        var classname = req.body.classname;
        var requesterId = req.userId;
        classService.addUser(classname, joinerEmail, requesterId, r=>{
            return res.json(r);
        });
    });

    

     app.delete("/userFromClass",  controllerUtils.requireLogin, function(req, res){
        const leaverId = req.body.leaverId;
        const classname = req.body.classname;
        const requesterId = req.userId;
        classService.removeUser(classname, leaverId, requesterId, r=>{
            return res.json(r);
        });
    });

    app.get("/leaveClass/:classname",  controllerUtils.requireLogin, function(req, res){
        const classname = req.params.classname;
        const userId = req.userId;
        classService.removeUser(classname, userId, userId, r=>{
            return res.json(r);
        });
    });

    app.get("/classIntegrants/:classname",  controllerUtils.requireLogin, function(req, res){
        const classname = req.params.classname;
        const userId = req.userId;
        classService.getClassIntegrants(classname, userId, r=>{
            return res.json(r);
        });
    });

    // returns integrants, if the user is the owner too and if class is private
    app.get("/classInfo/:classname",  controllerUtils.requireLogin, function(req, res){
        const classname = req.params.classname;
        const userId = req.userId;
        classService.getClassInfo(classname, userId, r=>{
            return res.json(r);
        });
    });

    app.get("/notifications",  controllerUtils.requireLogin, function(req, res){
        const userId = req.userId;
        notificationService.getNotifications(userId, r=>{
            return res.json(r);
        });
    });

    app.delete("/class/:classname",  controllerUtils.requireLogin, function(req, res){
        const classname = req.params.classname;
        const userId = req.userId;
        classService.mark4delete(classname, userId, r=>{
            return res.json(r);
        });
    });

    app.post("/duplicateCard2Class",  controllerUtils.requireLogin, function(req, res){
        const cardId = req.body.cardId;
        const classname = req.body.classname;
        const userId = req.userId;
        classService.duplicateCard2Class(classname, cardId, userId, r=>{
            return res.json(r);
        });
    });

    app.get("/classCards/:classname", controllerUtils.requireLogin, function(req, res){
        var params = {
            last: req.query.last,
            limit: req.query.limit,
            category: req.query.category,
            sort: req.query.sort,
            name: req.query.q
        };
        classService.getCards(req.params.classname, req.userId, params, function(result){
            res.json(result);
        });
    });

    app.post("/updateCardClass/:classname/:cardId",  controllerUtils.requireLogin, (req, res)=>{
        const cardId = req.params.cardId;
        const classname = req.params.classname;
        const userId = req.userId;
        const card = {
            name : req.body.name,
            description : req.body.description,
            category: req.body.category
        };
        classService.updateCard(classname, userId, cardId, card, r=>{
            return res.json(r);
        });
    });

    app.get("/classCategories/:classname", controllerUtils.requireLogin, (req, res)=>{
        var classname = req.params.classname;
        var userId = req.userId;
        classService.getCategories(classname, userId, r=>{
            return res.json(r);
        });
    });

    app.get("/classStats/:classname", controllerUtils.requireLogin, (req, res)=>{
        var classname = req.params.classname;
        var userId = req.userId;
        classService.getStats(classname, userId, r=>{
            return res.json(r);
        });
    });

    app.delete("/classCard/:classname/:id", controllerUtils.requireLogin, (req, res)=>{
        var classname = req.params.classname;
        var cardId = req.params.id;
        var userId = req.userId;
        classService.deleteCard(classname, userId, cardId, r=>{
            return res.json(r);
        });
    });

}