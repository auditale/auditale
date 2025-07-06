const express = require('express');
const { testingBaseURL } = require('./controllers/testingController');
const app = express();
const port = 3000;

app.get('/', testingBaseURL);

app.listen(port, () => {
    console.log(`Server running at: ${port}/`);
});

// Mongo DB Connection
const connectDB = require('./dbconnection')
connectDB();