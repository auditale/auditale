const User = require('../Models/userModel');
const { setUser } = require('../Auth/userAuth');
const Profile = require('../Models/profileModel');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

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
        const loggedInUserData = await User.findOne({ email, password });

        if(!loggedInUserData) return res.status(401).json({ error: "User not found. Please check the credential or register with us." });;

        const token = setUser(loggedInUserData);
        
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
    const profileData = await Profile.aggregate([
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
                    password: "$userdata.password" 
                }
            }
        ])

    if(!profileData) return res.status(400).json({ error: "Profile data is not found. Please add the data first." });
    return res.status(201).json(profileData);
}

async function handleAddUpdateProfileImage(req, res) {
    const userId = req.user.userData._id;

    const { profileImage } = req.body;
    if(!profileImage) return res.status(400).json({ error: "Please provide the url for the user profile picture." });

    const profileData = await Profile.findOneAndUpdate(
      { userId }, // find profile by user id
      { userId, profileImage }, // update or insert the profile data
      {
        upsert: true,
        new: true, // return the updated doc
        setDefaultsOnInsert: true
      }
    );

    if(!profileData) return res.status(400).json({ error: "Profile data is not generated. Please try again later" });
    return res.status(201).json({ message:"profile image add or updated successfully." });
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