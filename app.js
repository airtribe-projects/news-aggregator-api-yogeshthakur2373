const express = require('express');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { authenticateToken } = require('./middleware');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRETt;
const NEWS_API_KEY = process.env.NEWS_API_KEYy;
const users = [];
console.log('JWT_SECRET:', JWT_SECRET);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Signup Route
app.post('/users/signup', async (req, res) => {
    const { name, email, password, preferences } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required.' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ message: 'Email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ name, email, password: hashedPassword, preferences: preferences || [] });
    res.status(200).json({ message: 'User registered successfully.' });
});

// Login Route
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
});

// Get User Preferences
app.get('/users/preferences', authenticateToken, (req, res) => {
    const user = users.find(u => u.email === req.user.email);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ preferences: user.preferences || [] });
});

// Update User Preferences
app.put('/users/preferences', authenticateToken, (req, res) => {
    const user = users.find(u => u.email === req.user.email);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.preferences = req.body.preferences || [];
    res.json({ message: 'Preferences updated.', preferences: user.preferences });
});

// Fetch News Based on Preferences
app.get('/news', authenticateToken, async (req, res) => {
    try {
        const user = users.find(u => u.email === req.user.email);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const preferences = user.preferences || [];
        let category = '';
        let language = 'en';
        let sources = '';
 
        if (Array.isArray(preferences) && preferences.length > 0) {
            category = preferences[0];
        } else if (preferences.categories && preferences.categories.length > 0) {
            category = preferences.categories[0];
        }
        if (preferences.languages && preferences.languages.length > 0) {
            language = preferences.languages[0];
        }
        if (preferences.sources && preferences.sources.length > 0) {
            sources = preferences.sources.join(',');
        }

        const params = {
            apiKey: NEWS_API_KEY,
            category,
            language,
            pageSize: 10
        };
        if (sources) params.sources = sources;
        Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key];
        });

        const response = await axios.get('https://newsapi.org/v2/top-headlines', { params });
        res.json({ news: response.data.articles });
    } catch (error) {
        console.error('Error fetching news:', error.message);
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.message || 'Failed to fetch news.' });
        }
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

module.exports = app;