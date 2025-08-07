const User = require('../Models/userModel');
const { setUser } = require('../Auth/userAuth');
const Profile = require('../Models/profileModel');

async function handleRegisterUser(req, res) {
    try {
        const { username, email, password} = req.body;
        const registerUserData = await User.create({ username, email, password });

        if(!registerUserData) return res.status(400).json({ error: "User is not generated. Please try again later" });
        return res.status(201).json({"value": registerUserData });
        
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

        // perform the stateless authentication
        const token = setUser(loggedInUserData);
        res.cookie('uid', token);
        
        return res.status(201).json({"values": loggedInUserData});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }   
}

async function handleUserProfile(req, res) {
    const userId = req.data.loggedInUserData._id;
    const profileData = await Profile.findOne({ userId });

    if(!profileData) return res.status(400).json({ error: "Profile data is not found. Please add the data first." });
    return res.status(201).json({"value": profileData});
}

async function handleAddUpdateProfileImage(req, res) {
    const userId = req.data.loggedInUserData._id;

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
    return res.status(201).json({"value": profileData});
}

async function handleUpdateProfile(req, res) {
    const userId = req.data.loggedInUserData._id;
    const updates = {};

    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;


    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Please provide atleast username or email to update the profile data." });
    }

    const updatedProfileData = await User.updateOne(
        { _id: userId },
        { $set: updates}
    );
    return res.json({ "values": updatedProfileData });
}

module.exports = {
    handleRegisterUser,
    handleLoginUser,
    handleUserProfile,
    handleAddUpdateProfileImage,
    handleUpdateProfile
}