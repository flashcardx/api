const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const notificationService = require(appRoot + "/service/notificationService");
const controllerUtils = require(appRoot + "/middleware").utils;

module.exports = function(app){

app.get("/activity",  controllerUtils.requireLogin, function(req, res){
        const userId = req.userId;
        const page = req.query.page;
        notificationService.getNotifications(userId, page, r=>{
                return res.json(r);
        });
    });

    app.get("/activityCount",  controllerUtils.requireLogin, function(req, res){
        const userId = req.userId;
        notificationService.getNotificationsCount(userId,r=>{
            return res.json(r);
        });
    });

}