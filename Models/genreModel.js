const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    genreName:{
        type: String,
        required: true,
        unique: true
    },
    genreDesc:{
        type: String,
        required: true,
    }
}, { timestamps: true });

const genre = mongoose.model('genre', genreSchema);
module.exports = genre;