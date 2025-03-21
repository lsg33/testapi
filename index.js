const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors'); 

// Initialize Express
const app = express();

// CORS configuration for testing (allowing all origins)
app.use(cors({
  origin: '*',
}));

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://forcesspecial801:oCqg7zZg0MA95I5b@cluster777.atoevuq.mongodb.net/cluster777', { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema with AI field
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  AI: { type: Boolean, default: false },  // New AI field
  banned: { type: Boolean, default: false }  // New banned field
});

const User = mongoose.model('User', userSchema, 'users');

// Registration Route (Existing)
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Check if email ends with '@certaindomail.com'
  if (!email.endsWith('@jccschools.net')) {
    return res.status(400).json({ success: false, message: 'Sorry, your email must end with @jccschools.net' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving
    const newUser = new User({ firstName, lastName, email, password: hashedPassword, AI: false, banned: false });
    await newUser.save();
    res.json({ success: true });
  } catch (error) {
    // Handle errors (e.g., duplicate email)
    res.status(400).json({ success: false, message: 'Email already exists or invalid data.' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email not found' });
    }

    if (user.banned) {
      return res.status(400).json({ success: false, message: 'Your account is banned' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    // Successful login
    res.json({ success: true, message: 'Login successful!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check if user has AI access
app.post('/checkAI', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Check if the AI field is true
    if (user.AI) {
      return res.json({ AI: true });
    } else {
      return res.json({ AI: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/ban', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Ban the user
    user.banned = true;
    await user.save();

    res.json({ success: true, message: `User ${email} has been banned` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Default route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Access</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333;
          text-align: center;
          padding-top: 50px;
        }
        h1 {
          color: #e74c3c;
        }
        p {
          color: #2c3e50;
        }
      </style>
    </head>
    <body>
      <h1>Sorry, this is the API!</h1>
      <p>You are being redirected to the sign-up page...</p>
      <script>
        setTimeout(() => {
          window.location.href = 'https://lsg33.github.io/LSUG/register/'; // Redirect to the sign-up page
        }, 3000); // Redirect after 3 seconds
      </script>
    </body>
    </html>
  `);
});

// Start Server
app.listen(8080, () => {
  console.log('Server is running on https://lsg33.github.io/LSUG/:8080');
});
