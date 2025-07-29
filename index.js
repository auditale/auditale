const express = require('express');
const { testingBaseURL } = require('./Controller/testingController');
const { handleLoginUser, handleRegisterUser, handleUserProfile, handleAddUpdateProfileImage, handleUpdateProfile } = require('./Controller/authController');
const { handleAddCategory } = require('./Controller/categoryController');
const { handleAddStory } = require('./Controller/storyController');
const { handleAddFavourite, handleRemoveFavourite } = require('./Controller/favouriteController');
const { validateStory } = require('./Validators/storyValidator');
const { handleSearchStory } = require('./Controller/searchController');
const { handleAuthUser } = require('./Middlewares/authMiddleware');
const { validateLoginUser, validateRegisterUser } = require('./Validators/userValidator');
const { validateCategory } = require('./Validators/categoryValidator');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

app.use(express.json()); // for JSON payloads
app.use(express.urlencoded({ extended: true })); // for form submissions (x-www-form-urlencoded)
app.use(cookieParser());

app.get('/', testingBaseURL);

app.listen(port, () => {
    console.log(`Server running at: ${port}/`);
});

// Mongo DB Connection
const connectDB = require('./dbconnection');
connectDB();

// Users Routes
// app.post('/register', handleRegisterUser);
app.post('/register', validateRegisterUser, handleRegisterUser);
app.post('/login', validateLoginUser, handleLoginUser);
app.get('/getProfile', handleAuthUser, handleUserProfile);
app.post('/addProfileImage', handleAuthUser, handleAddUpdateProfileImage);
app.post('/updateProfile', handleAuthUser, handleUpdateProfile);

// Category Routes
app.post('/addCategory', validateCategory, handleAddCategory);

// Story Routes
app.post('/addStory', handleAuthUser, validateStory, handleAddStory);

// Favourite Routes
app.post('/addFav', handleAuthUser, handleAddFavourite);
app.post('/removeFav', handleAuthUser, handleRemoveFavourite);

// Search Routes
app.post('/searchStory', handleSearchStory);