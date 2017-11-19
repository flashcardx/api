const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const AWSService = require(appRoot + "/service/AWSService");
const cacheService = require(appRoot + "/service/cacheService");

module.exports = function(app){
    app.get('/texttospeechurl/:lang/:words',(req,res) => {
        
        if(!req.params.words){
            res.json({success: false, message:'Must provide a text'});
        }else{
            if(!req.params.lang){
                res.json({success: false, message:'Must provide a lang'});
            }else{
                
                cacheService.getPollyResults(req.params.lang,req.params.words)
                .then((data) => {
                    if(data){
                        res.send(AWSService.getUrl(data,'audio'));
                    }else{
                        AWSService.playSound(req.params.lang,req.params.words, r=>{
                            res.json(r);
                        })    
                    }
                })
            }
        }
    })
}