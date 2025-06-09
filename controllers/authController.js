const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

let resetTokens = {}; // In-memory (for demo only)

exports.register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });
    const user = new User({ email, password });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Register failed', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    resetTokens[token] = email;

    const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendEmail(email, 'Reset Password', `<a href="${link}">Click to reset</a>`);

    res.json({ message: 'Reset link sent' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending email' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const email = resetTokens[token];
    if (!email) return res.status(400).json({ message: 'Invalid token' });

    const user = await User.findOne({ email });
    user.password = password;
    await user.save();

    delete resetTokens[token];
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed' });
  }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      res.json({ message: 'Login successful' });
    } catch (err) {
      res.status(500).json({ message: 'Login failed' });
    }
  };