const mongoose = require('mongoose');
require('dotenv').config();

const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb+srv://appauditale:${DATABASE_PASSWORD}@cluster1.jvvrgaw.mongodb.net/`, {
    });

    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process on failure
  }
};

module.exports = connectDB;