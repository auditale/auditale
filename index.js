const express = require('express');
const { testingBaseURL } = require('./Controller/testingController');
const { handleLoginUser, handleRegisterUser, handleUserProfile, handleAddUpdateProfileImage, handleUpdateProfile, handleUpdatePassword } = require('./Controller/authController');
const { handleAddCategory } = require('./Controller/categoryController');
const { handleAddStory, handleGetAllStory, handleGetAllCategoryBasedStory } = require('./Controller/storyController');
const { handleAddRemoveFavourite } = require('./Controller/favouriteController');
const { handleAddRatings } = require('./Controller/ratingController');
const { validateStory } = require('./Validators/storyValidator');
const { handleAddHistory, handleGetHistory } = require('./Controller/historyController');
const { handleSearchStory, handleAddRemoveRecentSearched, handleGetAllRecentSearched } = require('./Controller/searchController');
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
app.post('/updatePassword', handleAuthUser, handleUpdatePassword);

// Category Routes
app.post('/addCategory', validateCategory, handleAddCategory);

// Story Routes
app.post('/addStory', handleAuthUser, validateStory, handleAddStory);
app.get('/getAllStory', handleAuthUser, handleGetAllStory);
app.get('/getCategoryBasedStory', handleAuthUser, handleGetAllCategoryBasedStory);


// Favourite Routes
app.post('/addRemoveFav', handleAuthUser, handleAddRemoveFavourite);

// Search Routes
app.post('/searchStory', handleSearchStory);
app.post('/addRemoveRecentSearched', handleAuthUser, handleAddRemoveRecentSearched);
app.get('/getRecentSearched', handleAuthUser, handleGetAllRecentSearched);

// Rating Routes
app.post('/addRating', handleAuthUser, handleAddRatings);

// History Routes
app.post('/addHistory', handleAuthUser, handleAddHistory);
app.get('/getHistory', handleAuthUser, handleGetHistory);