const imgDir = "temp";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const request = require("request");
const S = require("string");
const fs = require('fs');
const fsp = require('fs-promise');
const zlib = require('zlib');
const utils = require(appRoot + "/utils.js");
const md5File = require('md5-file/promise');
const Img = require(appRoot + "/models/imgModel");
const AWSService = require("./AWSService");

function getImgName(url, text){
     return text + Math.random() + S(url).strip(':', "/").s;
};

function download(uri, filename){
    return new Promise((resolve, reject)=>{
        request.head(uri, function(err, res, body){
        if(err)
           return reject(err);
        logger.debug('content-type:', res.headers['content-type']);
        logger.debug('content-length:', res.headers['content-length']);
        if(res.headers['content-type'] !== "image/jpeg" && res.headers['content-type'] !== "image/png")
            return reject(new Error("Content-type of uri is not supported, uri: " + uri));
        if(res.headers['content-length'] > config.APIMaxSizeUpFiles)
            return reject(new Error("size of file too big, size: " + res.headers['content-length']));
        request(uri).pipe(fs.createWriteStream(filename)).on('close',()=>{
            logger.debug(uri + " downloaded ok");
            resolve(res.headers['content-type']);
        })
        .on("error", ()=>{
            logger.debug("error when downloading file from: " + uri);
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
        if(!imgs || imgs.length === 0)
            return resolve([]);
        imgs.forEach((img)=>{
            if(img.url){
                            const imgPath = imgDir + "/" + getImgName(img.url, userId);
                            download(img.url, imgPath)
                            .then(ct=>{
                                contentType = ct;
                                return md5File(imgPath);
                            })
                            .then(hash=>{
                                return saveImgDb(imgPath, hash, contentType);
                                    })
                            .then(hash=>{
                                    imgHashes.push({
                                        hash: hash,
                                        width: img.width,
                                        height: img.height
                                    });
                                    return deleteFile(imgPath);
                                    })
                            .then(()=>{
                                    if(imgHashes.length === imgs.length)// if satisfies condition, this is the last cycle of the loop
                                        return resolve(imgHashes);  
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
                      AWSService.saveToS3Buffer(hash, img.data, (err,data)=>{
                            if(err)
                                return reject(err);
                            imgHashes.push({
                                    hash: hash,
                                    width: img.width,
                                    height: img.height
                                });
                            if(imgHashes.length === imgs.length)// if satisfies condition, this is the last cycle of the loop
                                    return resolve(imgHashes);  
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
    Img.findOne({ 'hash': hash}).exec()
                     .then(img=>{
                        img.timesUsed--;
                        if(img.timesUsed <= 0){
                            img.remove((err, count)=>{
                                if(err){
                                    logger.error(err);
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
                            img.save((err)=>{
                            if(err)callback(err);
                            return callback();
                            });
                        }
                     })
                     .catch(err=>{
                        logger.error(err);
                        callback(err);
                     });

};



function deleteImgsOnce(imgs){
    return new Promise((resolve, reject)=>{
        if(!imgs || imgs.length === 0)
            return resolve(true);
        imgs.forEach((img, index)=>{
            deleteImgOnce(img.hash, (err)=>{
                if(err)
                    return reject(err);
                if(index === imgs.length - 1)
                    return resolve(true);
            });
        });
    });
}

module.exports = {
    downloadArray: downloadArray,
    getImg: AWSService.getImgFromS3,
    deleteImgsOnce: deleteImgsOnce,
    increaseImgsCounter: increaseImgsCounter
}