const express = require('express');
const { testingBaseURL } = require('./Controllers/testingController');
const { handleRegisterUser } = require('./Controllers/authController');
const { validateLoginUser, validateRegisterUser } = require('./Validators/userValidator');

const app = express();
const port = 3000;

app.use(express.json()); // for JSON payloads
app.use(express.urlencoded({ extended: true })); // for form submissions (x-www-form-urlencoded)

app.get('/', testingBaseURL);
app.post('/register', validateRegisterUser, handleRegisterUser);


app.listen(port, () => {
    console.log(`Server running at: ${port}/`);
});

// Mongo DB Connection
const connectDB = require('./dbconnection')
connectDB();

// Users Route
app.post('/register', handleRegisterUser);