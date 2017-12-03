const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const userService = require(appRoot + "/service/userService");
const codeService = require(appRoot + "/service/codeService");
const AWSService = require(appRoot + "/service/AWSService");
const { check, param, query, body, validationResult } = require('express-validator/check');
const { matchedData, sanitizeParam } = require('express-validator/filter');
const controllerUtils = require(appRoot + "/middleware").utils;

module.exports = function(app){

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
        userService.findById(userId, "name email points -_id thumbnail", r=>{
            if(r.success == true)
                r.msg.thumbnail = AWSService.getUrl(r.msg.thumbnail);
            return res.json(r);
        });
    });

    app.get("/getUserInfo/:email",  controllerUtils.requireLogin, (req, res)=>{
        userService.findByEmail(req.params.email, "name thumbnail", r=>{
            if(r.success == true)
                r.msg.thumbnail = AWSService.getUrl(r.msg.thumbnail);
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


    /**
     * @api {post} /promocode link promocode with user
     * @apiGroup user
     * @apiName link promocode with user
     * @apiDescription link promocode with user account
     * @apiParam (Body) {Number} code promocode
     * @apiParam (Body) {String} userId the id of the user wich will get linked to the promocode
     * @apiParam (Request body) {string} g-recaptcha-response recaptcha token
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {json} Request-Example:
     * url: post /promocode
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true,
     *       "due": "2018-06-03T02:19:35.226Z"}
     * @apiVersion 1.1.0
     *  */
    app.post("/promocode", 
    controllerUtils.verifyRecaptcha,
    [
        body('code', 'count must be 10 chars long')
        .isLength({ min:10, max:10}),
        body('userId', 'userId must be a valid id')
        .isMongoId()
    ], controllerUtils.checkValidatorErrors,
    (req, res)=>{
        var userId = req.body.userId;
        codeService.linkUser(userId, req.body.code)
        .then(due=>{
            return res.json({success:true, due: due});
        }) 
        .catch(err=>{
            return res.json({success:false, msg:err});
        })
    });

}