const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtMiddleware = async (req, res, next) => {
  const token = req.cookies.auth_token;  // Get token from cookies
  if (!token) {
    console.log("No token found");
    return res.status(401).send('No token, authorization denied');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify token
    req.user = await User.findById(decoded.id);  // Get user from the decoded token
    console.log("Authenticated user:", req.user);
    next();  // Proceed to the next middleware
  } catch (error) {
    console.error("Invalid token:", error);
    res.status(401).send('Token is not valid');
  }
};

module.exports = jwtMiddleware;
