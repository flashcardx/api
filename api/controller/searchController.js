const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require('requestify'); 
const cache = require("memory-cache");
const S = require("string");
module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.get("/search/:criteria",controllerUtils.requireLogin,function(req,res){
        const criteria = S(req.params.criteria).replaceAll(" ", "+");
        const url = `${config.APIUrl}/?key=${config.APIKey}&q=${criteria}&lang=${req.user.lang}`;
        logger.debug("requesting to: " + url);
        var results = cache.get(criteria);
        if(results){
            res.json({success:true, msg:results});
        }
        else{
            requestify.get(url).then(function(response) {
                var resBody = response.getBody();
                cache.put(criteria, resBody, config.APICacheTime);
                res.json({success:true, msg:resBody});
        });

        }

    });


};