
var appRoot = require("app-root-path");
const codeService = require(appRoot + "/service/codeService");
const emailService = require(appRoot + "/service/emailService");
const config = require(appRoot + "/config");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const logger = config.getLogger(__filename);
const voucherCodes = require('voucher-code-generator');
const ERROR_THRESHOLD = 4;

logger.info("codeGen child process ready!");
config.connectMongoose();

process.on('message',({email, count, months, school, mode})=>{
  switch (mode) {
      case "gencode": return genCodesAndSendEmail(email, count, months, school);
     default: logger.fatal("codeGen subprocess got invalid mode: " + msg.mode);
  }
});

function genCodesAndSendEmail(email, count, months, school){
    const codes = genCodes(count);
    logger.error("codes: ", codes);
    saveCodes(codes, count, months, school)
    .then(persistedCodes=>{
        logger.error("persisted codes are: ", persistedCodes);
        return sendEmail(persistedCodes, email, count, months, school);
     })
    .catch(err=>{
        logger.fatal("error in function genCodesAndSendEmail at codeGen child process: ", err);
        emailService.sendText(email, "ERROR - PROMOCODES", JSON.stringify(err));
    })
}

function sendEmail(persistedCodes, email, count, months, school){
    var text = `AMOUNT OF CODES: ${count}, SCHOOL: ${school}, MONTHS TO BE VALID: ${months} \n\n`
    persistedCodes.forEach(code => {
        text += `${code}\n`    
    });
    return emailService.sendText(email, "PROMOCODES", text);
}

function saveCodes(codes, count,  months, school){
    return new Promise((resolve, reject)=>{
        if(codes.length < (count+ERROR_THRESHOLD))
            return reject("codes length is not enough");
       var r = [];
       var auxCode;
       for(var i=0; i < codes.length-ERROR_THRESHOLD; i++){
                const code = codes[i];
                 codeService.save(code, months, school)
                .then(()=>{
                     r.push(code);
                    if(r.length === count)
                        return resolve(r);
                })
                .catch(err=>{
                    logger.error("Promo code could not be saved, will try with another one: ", err);
                    auxCode = codes.pop();
                    codeService.save(auxCode, months, school) 
                    .then(()=>{
                        logger.info("second chance for saving code finished successfully");
                        r.push(auxCode);
                        if(r.length === count)
                            return resolve(r);
                    })
                    .catch(err=>{
                        reject(err);
                    })
                })
        }
    }); 
}

//generates count amount of codes plus ERROR_THRESHOLD more in case when we try to persist a code to the db some already taken, in that case we just insert one of this ERROR_THRESHOLD codes
function genCodes(count){
    logger.info("will generate: " + count+ERROR_THRESHOLD + " codes");
    return voucherCodes.generate({
        length: 10,
        count: count+ERROR_THRESHOLD,
        charset: "123456789ABCDEFGHIJKLMNPQRSTUVWXYZ"
    });
}
