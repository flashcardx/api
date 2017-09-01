const imgDir = "temp";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const request = require("request");
const S = require("string");
const fs = require('fs');
const fsp = require('fs-promise');
const md5File = require('md5-file/promise');
const Img = require(appRoot + "/models/imgModel");
const AWSService = require("./AWSService");
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
var thumb = require('node-thumbnail').thumb;
var gm = require('gm').subClass({imageMagick: true});

function genSmallThumbnailAndSaveToS3(name, buffer, callback){
   generateThumbnailAndSaveToS3(name, buffer, 150, 150, callback);
}

///returns filename from the thumbnail
function generateThumbnailAndSaveToS3(name, buffer, w, h, callback){
     var src = imgDir +"/"+ name;
    fs.writeFile(src, buffer, function(err) {
        if(err) {
            return logger.error(err);
        }
        gm(src)
            .resize(w, h, '^')
            .resize('200', '200', '^')
            .noProfile()
            .write(src, err=>{
               if(err){
                   logger.error(err);
                   return callback({success:false, msg:err});
               }
                fsp.readFile(src).
                then(data=>{
                    AWSService.saveToS3Buffer(name, data, r=>{
                        deleteFile(src)
                        .then(()=>{
                            return callback(r);
                        })
                        .catch(err=>{
                            logger.error(err);
                            return callback({success:false, msg:err});
                         });
                    });
                })
                 .catch(err=>{
                         logger.error(err);
                         return callback({success:false, msg:err});
                    });
            });
        }); 
}

function getImgName(url, text){
     return text + Math.random() + new Date();
};

var requestNoEncoding = request.defaults({ encoding: null });

//should calculate md5 like card imgs
function saveImgFromUrl(url){
    return new Promise((resolve, reject)=>{
        var img = new Img;
        img.hash = img._id;
        requestNoEncoding.get(url, function (err, res, body) {
            AWSService.saveToS3Buffer(img.hash, body, err=>{
                if(err)
                    return reject(err);
                img.save(err=>{
                    if(err)
                        return reject(err);
                    return resolve(img.hash);
                });    
            }); 
        });
    });
}

function saveImgFromBuffer(buffer){
    return new Promise((resolve, reject)=>{
        var img = new Img;
        img.hash = img._id;
       AWSService.saveToS3Buffer(img.hash, buffer, err=>{
            if(err)
                    return reject(err);
                img.save(err=>{
                    if(err)
                        return reject(err);
                    return resolve(img.hash);
                });    
            }); 
        });
}

const downloader = require('image-downloader');

function download(uri, filename){
    return new Promise((resolve, reject)=>{
                    request.head(uri, function(err, res, body){
                    if(err)
                        return reject(err);
                    logger.debug("headers: " + JSON.stringify(res.headers));
                    logger.debug('content-length: ' + res.headers['content-length']);
                    logger.debug('content-type: ' + res.headers['content-type']);

                    /*
                    if(res.headers['content-type'] !== "image/jpeg" && res.headers['content-type'] !== "image/png")
                        return reject(new Error("Content-type of uri is not supported, uri: " + uri +", content-type: " + res.headers['content-type']));
                    */
                
                    if(res.headers['content-length'] > config.APIMaxSizeUpFiles)
                        return reject(new Error("size of file too big, size: " + res.headers['content-length']));
                    var rq = request(uri, {headers:{"User-Agent": "NING/1.0"}});
                    rq.on("error", err=>{
                            logger.warn("error when making request for img download: " + err);
                            return reject("error when making request for img download: " + err);
                    })
                    rq.pipe(fs.createWriteStream(filename)).on('close',()=>{
                        logger.debug(uri + " downloaded ok");
                        resolve(res.headers['content-type']);
                    })
                    .on("error", (err)=>{
                        logger.warn("error when downloading file from: " + uri);
                        logger.warn("err: " + err);
                        reject("error when downloading file");
                    });
                })
                });
};

function deleteFile(filename){
    return new Promise((resolve, reject)=>{
        fs.unlink(filename, (err)=>{
        if(err)
            throw err;
        logger.debug(filename + " was deleted ok");
        resolve();
            });
    });
};

function increaseImgsCounter(imgs){
    var index = 0;
    return new Promise((resolve, reject)=>{
        if(imgs.length === 0)
            return resolve();
        imgs.forEach((img, index)=>{
                    if(!img.hash){
                        index++;
                        if(index == imgs.length)
                            return resolve();
                    }
                    else
                        Img.findOne({ 'hash': img.hash}).exec().then(doc=>{
                            if(doc){
                                doc.timesUsed++;
                                doc.save((err)=>{
                                    if(err)return reject(err);
                                    index++;
                                    if(index === imgs.length)
                                        return resolve();
                                });
                            }
                            else{
                                return reject("image does not exist");
                            }
                        })
            })
    })     
}

function saveImgDb(filename, hash, contentType){
    return new Promise((resolve, reject)=>{
        Img.findOne({ 'hash': hash}).exec().then((img=>{
            if(img){
                img.timesUsed++;
                img.save((err)=>{
                    if(err)return reject(err);
                    return resolve(hash);
                });
                return;
            }
            fsp.readFile(filename).then((data)=>{
            img = new Img;
            img.hash = hash;
            img.save((err)=>{
                if(err)
                    return reject(err);
                AWSService.saveToS3(hash, contentType, data, (err,data)=>{
                    if(err)
                        return reject(err);
                    resolve(hash);
                });
                    })
                });
        }), err=>{
            reject(err);
        });
    });
}

function downloadArray(imgs, userId, callback){
    return new Promise((resolve, reject)=>{
        var imgHashes = [];
        var contentType;
        var warning;
        if(!imgs || imgs.length === 0)
            return resolve([]);
        imgs.forEach((img)=>{
            if(img.url){
                            const imgPath = imgDir + "/" + getImgName(img.url, userId);
                            download(img.url, imgPath)
                            .catch(err=>{
                                    logger.warn("error when downloading imgs");
                                    warning = "Some images could not be downloaded";
                                    return Promise.resolve(null);
                                })
                            .then(ct=>{
                                if(!ct)
                                    return Promise.resolve(null);
                                contentType = ct;
                                return md5File(imgPath);
                            })
                            .then(hash=>{
                                if(!hash)
                                    return Promise.resolve(null);
                                return saveImgDb(imgPath, hash, contentType);
                            })
                            .then(hash=>{
                                    if(!hash){
                                        imgHashes.push({});
                                        return Promise.resolve(null);
                                    }
                                    imgHashes.push({
                                        hash: hash,
                                        width: img.width,
                                        height: img.height
                                    });
                                    return deleteFile(imgPath);
                                    })
                            .then(()=>{
                                    if(imgHashes.length === imgs.length)// if satisfies condition, this is the last cycle of the loop
                                        return resolve({imgHashes: imgHashes, warning:warning});  
                                    })
                            .catch(err=>{
                                    logger.error(err);
                                    return reject(String(err));
                                });
                
                        }//end if url
        else if(img.data){
            var hash = Date.now() + Math.random() + img.name;
            registerNewImgDb(hash)
                .then(()=>{
                        return imagemin.buffer(new Buffer(img.data),  {
                                                plugins: [
                                                    imageminJpegtran(),
                                                    imageminPngquant({quality: '60-80'})
                                                ]
                                            })
                        }
                )
                .then((data)=>{
                      AWSService.saveToS3Buffer(hash, data, (err,data)=>{
                            if(err)
                                return reject(err);
                            imgHashes.push({
                                    hash: hash,
                                    width: img.width,
                                    height: img.height
                                });
                            if(imgHashes.length === imgs.length)// if satisfies condition, this is the last cycle of the loop
                                    return resolve({imgHashes: imgHashes, warning:warning});  
                        });
                })
                .catch(err=>{
                         logger.error(err);
                         return reject(String(err));
                    });
        }// end if img.data
                });// end forEach
    });
};

function registerNewImgDb(hash){
    return new Promise((resolve, reject)=>{
        var img = new Img;
        img.hash = hash;
        img.save((err)=>{
                if(err)
                    return reject(err);
                return resolve();
        });
    })
}



function deleteImgOnce(hash, callback){
    Img.findOne({'hash': hash}).exec()
                     .then(img=>{
                        if(!img)
                            return callback({success:false, msg:"img not found"});
                        img.timesUsed--;
                        if(img.timesUsed <= 0){
                            img.remove((err, count)=>{
                                if(err){
                                    logger.error("err: " + err);
                                    return callback({success:false, msg:String(err)});
                                }
                                if(count === 0){
                                        logger.error("could not delete image(hash:"+hash +") from card");
                                        return callback({success:false, msg:"could not delete image from card"}); 
                                }
                                AWSService.removeFromS3(hash, callback);
                            });
                        }
                        else{
                            img.save(err=>{
                            if(err){
                                logger.error("error: " + JSON.stringify(err));
                                return callback({success:false, msg:err});
                            }
                            return callback({success:true});
                            });
                        }
                     })
                     .catch(err=>{
                        logger.error(err);
                        callback({success:false, msg:err});
                     });

};



function deleteImgsOnce(imgs){
    return new Promise((resolve, reject)=>{
        if(!imgs || imgs.length == 0){
            return resolve(true);
        }
        imgs.forEach((img, index)=>{
            deleteImgOnce(img.hash, r=>{
                if(r.success == false)
                    return reject(r.msg);
                if(index == imgs.length - 1)
                    return resolve(true);
            });
        });
    });
}

module.exports = {
    downloadArray: downloadArray,
    getImg: AWSService.getImgFromS3,
    deleteImgsOnce: deleteImgsOnce,
    increaseImgsCounter: increaseImgsCounter,
    deleteImgOnce: deleteImgOnce,
    genSmallThumbnailAndSaveToS3: genSmallThumbnailAndSaveToS3,
    saveImgFromUrl: saveImgFromUrl,
    saveImgFromBuffer: saveImgFromBuffer
}