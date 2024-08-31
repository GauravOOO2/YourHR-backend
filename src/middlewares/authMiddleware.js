const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Login authentication middleware
const loginAuthentication = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '2h' });
            return res.status(200).json({ token });
        } else {
            return res.status(400).json({ message: "User doesn't exist or password is incorrect" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

// JWT authentication for protected routes
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.log('JWT verification error:', err);
                return res.sendStatus(403); // Forbidden
            }
            console.log('Authenticated user:', user);
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
};


module.exports = { loginAuthentication, authenticateJWT };
