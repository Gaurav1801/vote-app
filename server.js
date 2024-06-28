const express = require('express')
const app = express();
const db = require('./db')
require('dotenv').config(); // allows to use the env file

const bodyParser = require('body-parser')
app.use(bodyParser.json()); //req.body
const PORT = process.env.PORT || 3000;

const userRoutes = require('./routes/UserRoutes')
const candidateRoutes = require('./routes/Candidateroutes')


app.use('/user', userRoutes)
app.use('/candidate', candidateRoutes)


app.listen(PORT, () => { console.log("server is runing on :", PORT) })