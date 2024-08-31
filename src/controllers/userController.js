const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Middleware for user signup
const signUpAuthentication = async (req, res, next) => {
    const {
        username,
        password,
        educationalDetails,
        workExperience,
        projects,
        skills,
        achievements
    } = req.body;

    // Convert yearOfCompletion to a number, if possible
    const parseEducationDetails = (details) => {
        return details.map(detail => ({
            ...detail,
            yearOfCompletion: isNaN(String(detail.yearOfCompletion)) ? null : String(detail.yearOfCompletion)
        }));
    };

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        } else {
            req.newUser = {
                username,
                password,
                educationalDetails: educationalDetails ? JSON.parse(educationalDetails) : [],
                workExperience: workExperience ? JSON.parse(workExperience) : [],
                projects: projects ? JSON.parse(projects) : [],
                skills: skills ? JSON.parse(skills) : [],
                achievements: achievements ? JSON.parse(achievements) : []
            };
            next();
        }
    } catch (error) {
        console.error('Error in signUpAuthentication:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Handle user signup
const signup = async (req, res) => {
    try {
        const resumeUrl = req.file ? req.file.path : null;
        req.newUser.resumeUrl = resumeUrl;
        const user = new User(req.newUser);
        await user.save();
        res.status(200).json({ message: "User created successfully" });
    } catch (err) {
        console.error('Error in signup:', err);
        res.status(500).json({ message: "Server error", err });
    }
};

// Handle user login
const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );
            res.status(200).json({ message: 'Logged in successfully', token });
        } else {
            res.status(400).json({ message: "Invalid username or password" });
        }
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: "Server error", error });
    }
};







// Handle user profile update
const updateProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user's profile data
        user.educationalDetails = JSON.parse(req.body.educationalDetails);
        user.workExperience = JSON.parse(req.body.workExperience);
        user.projects = JSON.parse(req.body.projects);
        user.skills = JSON.parse(req.body.skills);
        user.achievements = req.body.achievements;

        // If a new resume is uploaded, update the resumeUrl field
        if (req.file) {
            user.resumeUrl = req.file.path; // Ensure this matches your schema
        } else if (req.body.resumeUrl) {
            user.resumeUrl = req.body.resumeUrl; // Update existing resume URL
        }

        await user.save();
        res.json({ message: "Profile updated successfully", resumeUrl: user.resumeUrl });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error" });
    }
};



// Protected MainPage route
const mainPage = (req, res) => {
    res.json({ message: 'Welcome to the MainPage', user: req.user });
};

module.exports = { signUpAuthentication, signup, login, mainPage, updateProfile };
