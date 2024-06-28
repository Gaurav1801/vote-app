const mongoose = require('mongoose');
require('dotenv').config(); // allows to use the env file

const mongoURL = process.env.MONGODB_URL_LOCAL;
// const mongoURL = process.env.MONGODB_URL;

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const db = mongoose.connection;
db.on('error', () => { console.log('connnected error') });
db.on('disconnected', () => { console.log('connnected disconnected') });
db.on('connected', () => { console.log('connnected successfully') });

module.exports = db;