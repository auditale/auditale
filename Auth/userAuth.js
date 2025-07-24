const jwt = require('jsonwebtoken');
const secret = "auditale1234567890";

function setUser(loggedInUserData){
    return jwt.sign({
        loggedInUserData
    }, secret); 
}

function getUser(uid) {
    if(!uid) return res.json({ "value": "Please provide the uid" })
    return jwt.verify(uid, secret);
}

module.exports = {
    setUser,
    getUser
}