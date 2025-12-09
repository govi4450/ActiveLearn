const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // For simplicity, using username from session/body/params
    // In production, use JWT tokens
    // Check body first (POST requests), then params (GET requests with :username)
    const username = req.body.username || req.params.username;
    
    if (!username) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = auth;

