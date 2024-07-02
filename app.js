require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Import routes
const userRoutes = require('./routes/user');

// Get credentials from environment variables
const credentials = {
    user: process.env.DB_USER,
    pw: process.env.DB_PASSWORD,
    db: process.env.DB_NAME,
    key: process.env.DB_CLUSTER_KEY,
};

const access = `mongodb+srv://${credentials.user}:${credentials.pw}@${credentials.db}.${credentials.key}.mongodb.net/?retryWrites=true&w=majority`;

const app = express();
app.use(express.json());

mongoose
    // .connect(access, { useNewUrlParser: true, useUnifiedTopology: true })
    .connect(access)
    .then(() => {
        console.log('Connected to MongoDB!!!');
    })
    .catch(error => {
        console.error('Connection to MongoDB failed!!!');
        console.error(error);
    });

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    next();
});

// Using user routes
app.use('/api/user', userRoutes);


module.exports = app;
