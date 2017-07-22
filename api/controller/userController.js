const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const userService = require(appRoot + "/service/userService");
const categoryService = require(appRoot + "/service/categoryService");

module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.get("/categories", controllerUtils.requireLogin, (req, res)=>{
        const userId = req.userId;
        categoryService.getCategories(userId, r=>{
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

    app.get("/getUserInfo",  controllerUtils.requireLogin, (req, res)=>{
        const userId = req.userId;
        userService.findById(userId, "name email -_id", r=>{
            return res.json(r);
        });
    });

    app.get("/getUserInfo/:email",  controllerUtils.requireLogin, (req, res)=>{
        userService.findByEmail(req.params.email, "name", r=>{
            return res.json(r);
        });
    });


}