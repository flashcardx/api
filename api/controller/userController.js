const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const userService = require(appRoot + "/service/userService");
const categoryService = require(appRoot + "/service/categoryService");
const AWSService = require(appRoot + "/service/AWSService");

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
        userService.findById(userId, "name email -_id thumbnail", r=>{
            if(r.success == true)
                r.msg.thumbnail = AWSService.getImgUrl(r.msg.thumbnail);
            return res.json(r);
        });
    });

    app.get("/getUserInfo/:email",  controllerUtils.requireLogin, (req, res)=>{
        userService.findByEmail(req.params.email, "name thumbnail", r=>{
            if(r.success == true)
                r.msg.thumbnail = AWSService.getImgUrl(r.msg.thumbnail);
            return res.json(r);
        });
    });

    app.post("/changeUserImg", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        var file = new Buffer(req.body);
        userService.changeProfilePicture(userId, file, r=>{
            logger.error("result: " + JSON.stringify(r));
            return res.json(r);
        });
    });

    app.delete("/userProfileImage", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        userService.deleteProfilePicture(userId, r=>{
            return res.json(r);
        });
    });
    
}