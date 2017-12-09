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
const md5 = require("md5");
var thumb = require('node-thumbnail').thumb;
var gm = require('gm').subClass({imageMagick: true});
const fileType = require('file-type');

function isFileFormatValid(format){
    switch (format) {
        case "image/jpeg": return true;
        case "image/gif": return true;
        case "image/png": return true;
        case "text/html": return true;
        case "text/html; charset=UTF-8": return true;
    }
    return false;
}

function genAndSaveThumbnail(hash, buffer){
    var image = {
        timesUsed: 1,
        hash: hash
    }; 
    logger.error("old image: ", image);  
    var newImg = new Img(image);
    logger.error("about to save image: ", newImg);
    return newImg.save()
            .exec()
            .then(r=>{
                genSmallThumbnailAndSaveToS3(hash, buffer, r=>{
                    if(r.success == true)
                        return Promise.resolve();
                    return Promise.reject(r.msg);
                });
            });
}

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
                    AWSService.saveToS3(name, null, data, r=>{
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


function downloadAndGetBuffer(url){
    return new Promise((resolve, reject)=>{
        const options = {
                        url:url,
                        headers:{"User-Agent": "NING/1.0"},
                        timeout: 9000
                    };
        requestNoEncoding.head(options, (err, res, body)=>{
                    if(err)
                        return reject(err);
                    options.url = res.request.uri.href;
                    const contentType = res.headers['content-type'];
                    if(res.headers['content-length'] > config.MaxSizeUpFiles)
                        return reject("Size of file too big, size: " + res.headers['content-length']);
                    if(!isFileFormatValid(contentType))
                            return reject("Invalid file format: " + contentType);
                    requestNoEncoding.get(options, (err, res, body)=>{
                        if(err)
                            return reject(err);
                        if(res.headers['content-length'] > config.MaxSizeUpFiles)
                            return reject("Size of file too big, size: " + res.headers['content-length']);
                        if(!body)
                            return reject("Could not download image");
                        return resolve({contentType, buffer:body});
                    });
        });
    });
}

function saveThumbnailFromUrl(url){
    return saveImgFromUrl(url, "thumbnail");
}

//should calculate md5 like card imgs
function saveImgFromUrl(url, type){
    if(!url)
        return Promise.resolve();
    return new Promise((resolve, reject)=>{
            downloadAndGetBuffer(url)
            .then(r=>{
                return saveImgFromBuffer(r.buffer, r.contentType, type);
            })        
            .then(hash=>{
                return resolve(hash);
            }) 
            .catch(err=>{
                return reject(err);
            });
        });
}

function saveImgFromBuffer(buffer, contentType=fileType(buffer).mime, type){
    return new Promise((resolve, reject)=>{
            const hash = md5(buffer);
            AWSService.saveToS3(hash, contentType, buffer, err=>{
                logger.error("error: ", err);
                if(err)
                    return reject(err);
                var img = new Img;
                img.hash = hash;
                img.save(err=>{
                    if(err && err.code != 11000)
                        return reject(err);
                    return resolve(hash);
                });    
            }, type);
    })
}

const downloader = require('image-downloader');

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

function increaseImgCounter(hash){
    return Img.update({hash:hash}, {$inc:{"timesUsed":1}}).exec();
}

function deleteImgOnce(hash, callback){
    Img.findOne({'hash': hash})
                     .exec()
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

function proxyFromUrl(url, callback){
    saveImgFromUrl(url)
    .then(hash=>{
        return callback({success:true, hash:hash, src: AWSService.getUrl(hash)});
    })
    .catch(err=>{
        logger.error("error in proxyfromurl: ", err);
        return callback({success:false, msg: err});
    });
}

function proxyFromBuffer(buffer, callback){
    console.log("time 1: ", new Date().getTime());
    saveImgFromBuffer(buffer)
    .then(hash=>{
        return callback({success:true, hash:hash, src: AWSService.getUrl(hash)});
    })
    .catch(err=>{
        logger.error("error in proxyfromurl: ", err);
        return callback({success:false, msg: err});
    });
}

module.exports = {
    getImg: AWSService.getImgFromS3,
    deleteImgsOnce: deleteImgsOnce,
    increaseImgsCounter: increaseImgsCounter,
    deleteImgOnce: deleteImgOnce,
    genSmallThumbnailAndSaveToS3: genSmallThumbnailAndSaveToS3,
    proxyFromUrl: proxyFromUrl,
    proxyFromBuffer: proxyFromBuffer,
    saveImgFromUrl: saveImgFromUrl,
    increaseImgCounter: increaseImgCounter,
    genAndSaveThumbnail: genAndSaveThumbnail,
    saveThumbnailFromUrl: saveThumbnailFromUrl
}