const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const AWSService = require(appRoot + "/service/AWSService");
const AWSPolly = require(appRoot + "/service/AWSPollyService");

module.exports = function(app){
    app.get('/playsound/:text',(req,res) => {
        if(!req.params.text){
            res.json({success: false, message:'Must provide a text'});
        }else{
            res.send('Play');
            AWSPolly.playSound(req.params.text);
        }
    })
}