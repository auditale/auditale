const { getUser } = require('../Auth/userAuth');

async function handleAuthUser(req, res, next) {

    const uid = req.cookies.uid;
    if(!uid) return res.status(401).json({error: "Please login with the cookie"})

    const Userdata = getUser(uid);
    if(!Userdata) return res.status(404).json({ error: "User not found. Please register first" })
    
    req.data = Userdata;
    next();
}


module.exports = {
    handleAuthUser
}