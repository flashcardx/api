const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cardSchema = new Schema({
    name: String,
    description: String,
    urls: [String]
});

const Card = mongoose.model('cards', cardSchema);

module.exports = Card ;