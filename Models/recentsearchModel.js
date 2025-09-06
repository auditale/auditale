const mongoose = require('mongoose');

const recentsearchSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This should match the name of your User model
        required: true
    },
    searchTerm:{
        type: String,
        required: true,
    }
}, { timestamps: true });

const RecentSearch = mongoose.model('RecentSearch', recentsearchSchema);
module.exports = RecentSearch;