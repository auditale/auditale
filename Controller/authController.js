const User = require('../Models/userModel');
const { setUser } = require('../Auth/userAuth');
const Profile = require('../Models/profileModel');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const projectId = 'tactical-hope-475616-q7';
const keyFilename = path.join(__dirname, '..', 'Google_storage', 'tactical-hope-475616-q7-4bb9908b0051.json');

// Initialize Google Cloud Storage
const storage = new Storage({ projectId, keyFilename });

async function handleRegisterUser(req, res) {
    try {
        const { username, email, password} = req.body;
        const registerUserData = await User.create({ username, email, password });

        if(!registerUserData) return res.status(400).json({ error: "User is not generated. Please try again later" });
       
        const token = setUser(registerUserData);
        
        return res.status(200).json({
            message: "Register successful",
            token,
            registerUserData: {
                id: registerUserData._id,
                email: registerUserData.email
            }
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleLoginUser(req, res) {
    try {
        const { email, password } = req.body;
        const loggedInUserEmail = await User.findOne({ email });
        if(!loggedInUserEmail) return res.status(401).json({ error: "User not found. Please check the email." });

        const loggedInUserPassword = await User.findOne({ password });
        if(!loggedInUserPassword) return res.status(401).json({ error: "User not found. Please check the password." });

        const loggedInUserData = await User.findOne({ email, password });
        const token = setUser(loggedInUserData);
        
        if(!loggedInUserData){
            return res.status(404).json({ error:"User is not found, please check your credentials." });  
        }
        
        return res.status(200).json({
            message: "Login successful",
            token,
            loggedInUserData: {
                id: loggedInUserData._id,
                email: loggedInUserData.email
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }   
}

async function handleUserProfile(req, res) {
    const userId = req.user.userData._id;
    const userProfileData = await Profile.findOne({ userId });

    if(!userProfileData){
        const finalUserProfileData = await User.findOne({ _id: userId }, { username: 1, email: 1, profileImage:"not found", _id: 0 });
        if(!finalUserProfileData) return res.status(400).json({ error: "Profile data is not found. Please add the data first." });
        return res.status(200).json(finalUserProfileData);
    }else{

        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 1000 * 60 * 15, // URL valid for 15 minutes
        };

        const [signedUrl] = await storage.bucket('testing-auditale-1').file(userProfileData.profileImage).getSignedUrl(options);

        const finalUserProfileData = await Profile.aggregate([
            {
                $match: {
                    "userId": new ObjectId(userId)
                }
            },
            // join with profile - user
            {   $lookup:{
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userdata"
                }
            },
            {   $unwind: {
                    path: "$userdata",
                    preserveNullAndEmptyArrays: true
                }
            },
            {   $project: {
                    userId: 1,
                    username: "$userdata.username",
                    email: "$userdata.email",
                    profileImage: signedUrl
                }
            }
        ]);
        if(!finalUserProfileData) return res.status(400).json({ error: "Profile data is not found. Please add the data first." });
        return res.status(200).json(finalUserProfileData);
    }
}

async function handleAddUpdateProfileImage(req, res) {
}

async function handleUpdateProfile(req, res) {
    const userId = req.user.userData._id;
    const updates = {};

    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;


    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Please provide atleast username or email to update the profile data." });
    }

    const updatedProfileData = await User.findOneAndUpdate(
        { _id: userId },
        { $set: updates},
        { new: true }
    );

    return res.json(updatedProfileData);
}

async function handleUpdatePassword(req, res) {
    try{
        const userId = req.user.userData._id;
        const { oldPassword, newPassword } = req.body;
        const updates = {};

        const loggedInUserData = await User.find({ _id: userId, password: oldPassword });

        if(loggedInUserData.length != 0) {
            updates.password = newPassword;
            const updatedPasswordData = await User.findOneAndUpdate(
                { _id: userId },
                { $set: updates },
                { new: true }
            );  
            if(updatedPasswordData) return res.status(200).json({ message:"Password is updated successfully." });
        }else{
            return res.status(404).json({ error:"User is not found, please check your existing password again." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleRegisterUser,
    handleLoginUser,
    handleUserProfile,
    handleAddUpdateProfileImage,
    handleUpdateProfile,
    handleUpdatePassword
}