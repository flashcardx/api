const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require('requestify'); 
const cache = require("memory-cache");
const S = require("string");
const userService = require(appRoot + "/service/userService");
module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.get("/search/:criteria",controllerUtils.requireLogin,function(req,res){
        userService.findById(req.userId, (result)=>{
                if(!result.success)
                    return res.json(result);
                const user = result.msg;
                const criteria = S(req.params.criteria).replaceAll(" ", "+");
                var page = 1;
                if(req.query.page)
                    page = req.query.page;
                const cacheKey = criteria + user.lang + page;
                const url = `${config.APIUrl}/?key=${config.APIKey}&q=${criteria}&lang=${user.lang}&page=${page}`;
                logger.debug("requesting to: " + url);
                var results = cache.get(cacheKey);
                if(results){
                    res.json({success:true, msg:results});
                }
                else{
                    requestify.get(url).then(function(response) {
                        var resBody = response.getBody();
                        cache.put(cacheKey, resBody, config.APICacheTime);
                        res.json({success:true, msg:resBody});
                    });
                }
            });
        });


};