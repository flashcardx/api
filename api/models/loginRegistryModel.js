const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lrSchema = new Schema({

    userId:{
        type: Schema.Types.ObjectId
    },
    userEmail:{
        type: String
    },
    date: { type: Date, expires: '8h', default: Date.now }
});


const model = mongoose.model('loginRegistry', lrSchema);

module.exports = model;