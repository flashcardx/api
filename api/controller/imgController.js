const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const Img = require(appRoot + "/models/imgModel");
const imgService = require(appRoot + "/service/imgService");

module.exports = function(app){

    app.get("/image/:id", function(req, res){
        imgService.getImg(req.params.id, function(err, type, img){
            if(err)
                res.json({success:false, msg:String(err)});
            else{
                res.contentType(type);
                res.send(img);
            }
        });
    });

}