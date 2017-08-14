const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require('requestify'); 
const cacheService = require("./cacheService");
const shutterstock = require('shutterstock');
const pixabayBaseUrl = `${config.APIPixabayUrl}/?key=${config.APIPixabayKey}`;
const MAX_PER_PAGE = 20;
const MINIMUM = 15;
const shutterstockAPI = shutterstock.v2({
  clientId: '2a32fb3e058e7de16156',
  clientSecret: '0d096f428d635dd82c83ed3b87116370c2825255',
});


function searchBing(q, clientIp, callback){
    if(!clientIp){
        logger.error("client ip undefined, will be replaced with empty string, if this continues Bing may think it is ddos attack");
        clientIp = clientIp;
    }
    cacheService.getBingResults(q)
    .then(r=>{
            if(r){
                callback({success:true, msg:r});
                return Promise.resolve(null);
            }
            return Promise.resolve(1);
    })
    .then(r=>{
        if(!r)
            return Promise.resolve();
        var url = config.BingUrl + "?q=" + q  + "&count=35" + "&size=Medium";
        return requestify.get(url, { 
                    headers:{
                    "Ocp-Apim-Subscription-Key": config.BingKey
                    //,"X-Search-ClientIP": clientIp
                }})
    })
    .then(response=>{
        if(!response)
            return; 
        var r = response.getBody();
        cacheService.putBingResults(q, r);
        return callback({success:true, msg:r});
    })
    .catch(err=>{
        logger.error('Encountered error making request:' + JSON.stringify(err));
        return callback({success:false, msg:err});
    });
}


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
        search: search,
        searchBing: searchBing
    }