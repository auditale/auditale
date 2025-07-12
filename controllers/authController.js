const User = require('../Models/userModel');

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

module.exports = {
    handleRegisterUser
}