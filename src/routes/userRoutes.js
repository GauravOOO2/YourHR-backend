const express = require('express');
const { signup, login, mainPage, signUpAuthentication, updateProfile } = require('../controllers/userController');
const { loginAuthentication, authenticateJWT } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const User = require('../models/userModel');
const router = express.Router();

// Signup route with resume upload
router.post('/signup', upload.single('resume'), signUpAuthentication, signup);

// Login route
router.post('/login', login);

// Protected MainPage route
router.get('/MainPage', authenticateJWT, mainPage);

// Route to fetch user data by username
router.get('/user/:username', authenticateJWT, async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
});

// Route to update user profile
router.put('/user/update', authenticateJWT, upload.single('resume'), updateProfile);


module.exports = router;
