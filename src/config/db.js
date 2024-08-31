const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: "newUsers"
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error", error);
    }
};

module.exports = connectDB;
