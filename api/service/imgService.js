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

function saveImgDb(filename, hash, contentType){
    return new Promise((resolve, reject)=>{
        Img.findOne({ 'hash': hash}).exec().then((img=>{
            if(img){
                img.timesUsed++;
                img.save((err)=>{
                    if(err)reject(err);
                    return resolve(img);
                });
                return;
            }
            fsp.readFile(filename).then((data)=>{
            img = new Img;
            logger.info("size of img before zip: " + utils.roughSizeOfObject(data));
            zlib.deflate(data, (err, result)=>{
                if(err)
                    throw err;
                logger.info("size of img after zip: " + utils.roughSizeOfObject(result));
                img.data.data = result;
                img.contentType = contentType;
                img.hash = hash;
                img.save((err)=>{
                    if(err)reject(err);
                    resolve(img);
                    })
                });
            });
        }), err=>{
            reject(err);
        });
    });
}


function downloadArray(urls, userId, callback){
    return new Promise((resolve, reject)=>{
        var imgIds = [];
        var contentType;
        if(!urls || urls.length === 0)
            return resolve([]);
        urls.forEach((url)=>{
            const imgPath = imgDir + "/" + getImgName(url, userId);
            download(url, imgPath)
            .then(ct=>{
                contentType = ct;
                return md5File(imgPath);
            })
            .then(hash=>{
                 return saveImgDb(imgPath, hash, contentType);
                    })
            .then(img=>{
                     imgIds.push(img._id);
                     return deleteFile(imgPath);
                    })
            .then(()=>{
                    if(imgIds.length === urls.length)// if satisfies condition, this is the last cycle of the loop
                        return resolve(imgIds);  
                    })
                    .catch(err=>{
                        logger.error(err);
                        return reject({success:false, msg:String(err)});
                    });
        });
    });
};

function getImg(id, callback){
    Img.findById(id, (err, doc)=>{
        if (err) return callback(err);
        if(!doc) return callback("no img found");
        logger.info("size of img before unzip: " + utils.roughSizeOfObject(doc.data.data));
        zlib.inflate(doc.data.data, (err, result)=>{
        logger.info("size of img after unzip: " + utils.roughSizeOfObject(result));
            if(err)
                throw err;
            callback(null, doc.contentType, result);
        });
        
    });
}

function deleteImgOnce(id, callback){
    Img.findById(id).exec()
                     .then(img=>{
                        img.timesUsed--;
                        if(img.timesUsed <= 0){
                            img.remove(err=>{
                                callback(err);
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
                        callback(err);
                     });

};

function deleteImgsOnce(imgsId){
    return new Promise((resolve, reject)=>{
        if(!imgsId || imgsId.length === 0)
            return resolve(true);
        imgsId.forEach((id, index)=>{
            deleteImgOnce(id, (err)=>{
                if(err)
                    return reject(err);
                if(index === imgsId.length - 1)
                    return resolve(true);
            });
        });
    });
}

module.exports = {
    downloadArray: downloadArray,
    getImg: getImg,
    deleteImgsOnce: deleteImgsOnce
}