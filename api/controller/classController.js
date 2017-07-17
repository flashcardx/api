const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const controllerUtils = require("./utils");
const logger = config.getLogger(__filename);
const Img = require(appRoot + "/models/imgModel");
const classService = require(appRoot + "/service/classService");

module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.post("/createClass",  controllerUtils.requireLogin, function(req, res){
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

    app.get("/getClasses", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        classService.listAll(userId, r=>{
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

    


}