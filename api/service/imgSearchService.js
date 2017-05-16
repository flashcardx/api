const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require('requestify'); 
const cache = require("memory-cache");
const shutterstock = require('shutterstock');
const shutterstockAPI = shutterstock.v2({
  clientId: '2a32fb3e058e7de16156',
  clientSecret: '0d096f428d635dd82c83ed3b87116370c2825255',
});
const pixabayBaseUrl = `${config.APIPixabayUrl}/?key=${config.APIPixabayKey}`;
const MAX_PER_PAGE = 20;
const MINIMUM = 15;


function search(criteria, lang, page, callback){
                const cacheKey = criteria + lang + page;
                var results = cache.get(cacheKey);
                if(results){
                    return callback({success:true, msg:results});
                }
                const url = pixabayBaseUrl + `&q=${criteria}&lang=${lang}&page=${page}`;
                if(page && page!=1){
                    return searchPixabay(url, (result)=>{
                        cache.put(cacheKey, result, config.APICacheTime);
                        return callback({success:true, msg:result});
                    });
                }
                return searchPage1(criteria, lang, page, (result)=>{
                    cache.put(cacheKey, result, config.APICacheTime);
                    return callback({success:true, msg:result});
                });
}

function searchPage1(criteria, lang, page, callback){
    const url = pixabayBaseUrl + `&q=${criteria}&lang=${lang}&page=${page}`;
    var api1Ready = false;
    var api2Ready = false;
    var results1 = [];
    var results2 = [];
    searchPixabay(url, result=>{
            var l1 = result.hits.length;
            if(l1 <= MINIMUM){
                            if(api2Ready ===true){
                                var nedded = MAX_PER_PAGE - l1;
                                if(result.hits)
                                    result.hits = result.hits.concat(results2.slice(0, nedded));
                                else
                                    result.hits = results2.slice(0, nedded);
                                result.totalHits = result.hits.length;
                                return callback(result);
                            }
                            else{
                                results1 = result;
                                api1Ready = true;
                                return;
                            }
                        }
         return callback(result);
    });
    searchShutterstock(criteria, 1,  result=>{
        if(api1Ready === false){
            results2 = result;
            api2Ready = true;
            return;
        }
        if(!results1.hits)
            results1.hits = [];
        var l1 = results1.hits.length;
        var nedded = MAX_PER_PAGE - l1;
        results1.hits = results1.hits.concat(result.slice(0, nedded));
        results1.totalHits = results1.hits.length;
        return callback(results1);
    });
}

function searchShutterstock(criteria, page, callback){
    shutterstockAPI.image.search({query:criteria, page:page}, (err, response)=>{
                var results = [];
                if (err){
                    logger.error(err);
                    return callback([]);
                }   
                  for(var i=0; i < response.data.length;i++){
                            results.push({
                                previewHeight: response.data[i].assets.large_thumb.height,
                                previewWidth: response.data[i].assets.large_thumb.width,
                                webformatHeight: response.data[i].assets.preview.height,
                                webformatWidth: response.data[i].assets.preview.width,
                                previewURL: response.data[i].assets.large_thumb.url,
                                webformatURL: response.data[i].assets.preview.url
                            });   
                        }
                return callback(results);
    });
} 

function searchPixabay(url, callback){
    requestify.get(url).then(response=>{
            var resBody = response.getBody();
            return callback(resBody);
    });
}


/*
function search(criteria, lang, page, callback){

                var api1Ready = false;
                var results1 = [];
                var api2Ready = false;
                var results2 = [];
                const cacheKey = criteria + lang + page;
                const url = pixabayBaseUrl + `&q=${criteria}&lang=${lang}&page=${page}`;
                var results = cache.get(cacheKey);
                if(results){
                    return callback({success:true, msg:results});
                }
                else{
                     shutterstockAPI.image.search({query:criteria, per_page:MAX_PER_PAGE}, (err, response)=>{
                        logger.error("shutterstock ready");
                        if (err){
                            logger.error(err);
                            return;
                        }
                        for(var i=0; i < response.data.length;i++){
                            results1.push({
                                previewHeight: response.data[i].assets.large_thumb.height,
                                previewWidth: response.data[i].assets.large_thumb.width,
                                webformatHeight: response.data[i].assets.preview.height,
                                webformatWidth: response.data[i].assets.preview.width,
                                previewURL: response.data[i].assets.large_thumb.url,
                                webformatURL: response.data[i].assets.preview.url
                            });   
                        }
                        if(api2Ready === false){
                            api1Ready = true;
                            return;
                        }
                        results2.hits.push(results1);
                        results2.totalHits = results2.hits.length;
                        cache.put(cacheKey, results2, config.APICacheTime);
                        return callback({success:true, msg:results2});
                    });
                    requestify.get(url).then(response=>{
                         logger.error("pixabay ready");
                        var resBody = response.getBody();
                        if(resBody.totalHits <= MINIMUM){
                            if(api1Ready ===true){
                                resBody.hits.push(results1);
                                logger.error("r1: " + results1.length);
                                logger.error("rb: " + resBody.hits.length);
                                resBody.totalHits = resBody.hits.length;
                                cache.put(cacheKey, resBody, config.APICacheTime);
                                return callback({success:true, msg:resBody});
                            }
                            else{
                                results2 = resBody;
                                api2Ready = true;
                                return;
                            }
                        }
                        else{
                            cache.put(cacheKey, resBody, config.APICacheTime);
                            return callback({success:true, msg:resBody});
                        }
                    });
                }
}*/



function completeResults(results, criteria, callback){
    const amountToAdd = MAX_PER_PAGE - results.totalHits;
    shutterstockAPI.image.search({query:criteria, per_page:amountToAdd}, (err, response)=>{
                    if (err){
                        logger.error(err);
                        return callback(results);
                    }
                    for(var i=0; i < response.data.length;i++){
                        results.hits.push({
                            previewHeight: response.data[i].assets.large_thumb.height,
                            previewWidth: response.data[i].assets.large_thumb.width,
                            webformatHeight: response.data[i].assets.preview.height,
                            webformatWidth: response.data[i].assets.preview.width,
                            previewURL: response.data[i].assets.large_thumb.url,
                            webformatURL: response.data[i].assets.preview.url
                        });   
                    }
                    results.totalHits = results.hits.length;
                    return callback(results);
                });
}


module.exports = {
        search: search
    }