const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This should match the name of your Story model
        required: true
    },
    profileImage:{
        type: String,
        required: true,
    }

}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;