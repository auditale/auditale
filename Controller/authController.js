const User = require('../Models/userModel');
const { setUser } = require('../Auth/userAuth');

async function handleRegisterUser(req, res) {
    try {
        const { username, email, password} = req.body;
        const registerUserData = await User.create({username, email, password});

        if(!registerUserData) return res.status(400).json({ error: "User is not generated. Please try again later" })
        return res.status(201).json({"value":"data inserted successfully"})
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleLoginUser(req, res) {

    try {
        const { email, password } = req.body;
        const loggedInUserData = await User.findOne({ email, password});

        if(!loggedInUserData) return res.status(401).json({ error: "User not found. Please check the credential or register with us."});

        // perform the stateless authentication
        const token = setUser(loggedInUserData);
        res.cookie('uid', token);
        
        return res.status(201).json({"values": loggedInUserData});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }   
}

module.exports = {
    handleRegisterUser,
    handleLoginUser
}