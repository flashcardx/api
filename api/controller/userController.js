const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const userService = require(appRoot + "/service/userService");


module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.get("/categories", controllerUtils.requireLogin, (req, res)=>{
        const userId = req.userId;
        userService.getCategories(userId, r=>{
            return res.json(r);
        })
    });

    app.get("/userPlan", controllerUtils.requireLogin, (req, res)=>{
        const userId = req.userId;
        userService.getPlan(userId, r=>{
            return res.json(r);
        })
    });

    app.get("/userLang", controllerUtils.requireLogin, (req, res)=>{
        const userId = req.userId;
        userService.getUserLang(userId, r=>{
            return res.json(r);
        })
    });

     app.get("/updateUserLang/:lang",  controllerUtils.requireLogin, (req, res)=>{
        const lang = req.params.lang;
        const userId = req.userId;
        userService.updateLang(userId, lang, r=>{
            return res.json(r);
        });

    });



}