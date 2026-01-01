const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../model/userModel');
dotenv.config();
const isAuthenticated = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({success:false,message: "Authorization header missing or malformed" });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({success:false,message: "Invalid or expired token" });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
        return res.status(404).json({success:false,message: "User not found" });
    }
    if (!user.isvarified) {
        return res.status(403).json({success:false,message: "Email not verified" });
    }
    req.userId = decoded.id;
    next();
};
module.exports = isAuthenticated;