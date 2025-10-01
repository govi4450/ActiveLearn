const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // For simplicity, using username from session/body
    // In production, use JWT tokens
    const { username } = req.body;
    
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

