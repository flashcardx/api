const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require("mongoose");
const seed = require(appRoot + "/config/seed");
const config = require(appRoot + "/config");
const Cards = require(appRoot + "/models/cardModel");
const Users = require(appRoot + "/models/userModel");
const logger = config.getLogger(__filename);
const userService = require(appRoot + "/service/userService");
const cardService = require(appRoot + "/service/cardService");
const masterService = require(appRoot + "/service/masterService");
const { check, param, query, body, validationResult } = require('express-validator/check');
const { matchedData, sanitizeParam } = require('express-validator/filter');
const controllerUtils = require(appRoot + "/middleware").utils;
const Logins = require(appRoot + "/models/loginRegistryModel");

module.exports = function(app){

    app.get("/setup", function(req, res){
          if(env !== "development" && env !== "pi"){
            logger.warn(req.connection.remoteAddress + " tried to access /setup in " + env);
            res.send("setup not available at this environment");
          }
          else{
            logger.warn("database is about to be dropped");
            mongoose.connection.db.dropDatabase();
            createUsers()
            .then(()=>{
              logger.info("users were created ok");
              res.send("setup succeded!");
            })
            .catch(err=>{
                    logger.error("err: " + err);
                    return res.send({success:false, msg:err});
                });
         }
    });

     /**
     * @api {get} /promocodes/:count/:months generate promocodes
     * @apiGroup master
     * @apiName generate promocodes
     * @apiDescription generate unique promocodes for schools or individuals.
     * @apiParam (Parameters) {Number} How manny codes do you wanna generate?. must be between 1 and 2000
     * @apiParam (Parameters) {Number} months integer between 1 and 6 representing the duration of the promocodes 
     * @apiParam (Query) {string} [school] in case codes are for a teacher/org you gotta send the org/teacher name. this school must already exist on the system!
     * @apiHeader (Headers) {string} x-access-token Master user session token
     * @apiParamExample {json} Request-Example:
     * url: /promocodes/3/4?school=whatever
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true,
     *      "msg": "promocodes will be sent to you by email"
     *      }
     * @apiVersion 1.1.0
     *  */
    app.get("/promocodes/:count/:months", controllerUtils.requireMasterLogin, sanitizeParam('count').toInt(),
        [
            param('count')
            .custom(count=>{
                if(count < 1 || count >2000)
                throw new Error('count must be 1<=count<=2000');
                return true;
            }),
            param("months")
            .custom(months=>{
                if(months < 1 || months >6)
                    throw new Error('months must be 1<=months<=6');
                return true;
            }),
            query("school", "school length too long")
            .isLength({ max:40})
        ], controllerUtils.checkValidatorErrors,
        (req, res)=>{
            const email = req.email,
                count = req.params.count,
                months = req.params.months,
                school = req.query.school;
            masterService.genCodes(email, count, months, school);
            return res.json({success:true, msg: "The codes will be sent to your email when they are ready"});
    });


    /**
     * @api {get} /userCount count all users
     * @apiGroup master
     * @apiName count all users
     * @apiDescription returns the count for all the users in the system.
     * @apiHeader (Headers) {string} x-access-token Master user session token
     * @apiParamExample {json} Request-Example:
     * url: /userCount
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true,
     *      "count": 456788
     *      }
     * @apiVersion 1.1.0
     *  */
    app.get("/userCount", controllerUtils.requireMasterLogin, (req, res)=>{
        userService.countAll()
        .then(count=>{
            return res.json({success:true, count: count});
        })
        .catch(err=>{
            return res.json({success:false, msg: err});
        })
    })


     /**
     * @api {get} /cardCount count all cards
     * @apiGroup master
     * @apiName count all cards
     * @apiDescription returns the count for all the cards in the system.
     * @apiHeader (Headers) {string} x-access-token Master user session token
     * @apiParamExample {json} Request-Example:
     * url: /cardCount
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true,
     *      "count": 456788
     *      }
     * @apiVersion 1.1.0
     *  */
    app.get("/cardCount", controllerUtils.requireMasterLogin, (req, res)=>{
      cardService.countAll()
      .then(count=>{
          return res.json({success:true, count: count});
      })
      .catch(err=>{
          return res.json({success:false, msg: err});
      })
  })

   /**
     * @api {get} /loginRegistry last logins
     * @apiGroup master
     * @apiName last logins
     * @apiDescription returns info from the newest 60 logins in the last 8 hours.
     * @apiHeader (Headers) {string} x-access-token Master user session token
     * @apiParamExample {json} Request-Example:
     * url: /loginRegistry
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true,
     *      "msg": [
                        {
                            "_id": "5a23779fcd379524061691a3",
                            "userId": "5a235d02e9f5325496eebcfa",
                            "userEmail": "pablonicolasm.pm@gmail.com",
                            "date": "2017-12-03T04:03:43.638Z",
                            "__v": 0
                        }
                    ]
     *      }
     * @apiVersion 1.1.0
     *  */
  app.get("/loginRegistry", controllerUtils.requireMasterLogin, (req, res)=>{
        Logins.find({})
        .sort({date: "desc"})
        .limit(60)
        .lean()
        .exec()
        .then(r=>{
            return res.json({success:true, msg:r});
        })
        .catch(err=>{
            return res.json({success:false, msg: err});
        })
  })


}

function createUsers(result){
            logger.info("cards were created ok");
            return Users.create(seed.users);
};

