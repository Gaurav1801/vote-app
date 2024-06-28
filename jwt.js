const jwt = require('jsonwebtoken');
require('dotenv').config(); // allows to use the env file

const jwtAuthmiddleware = (req, res, next) => {

    const authorization = req.headers.authorization
    if (!authorization) return res.status(401).json({ error: "tken not found" })



    //extract jwt token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: "unauthorized" })

    try { //verfiy jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //attach user information to request body 
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: "Invalid token" })

    }
}
const generatetoken = (userData) => {
    //generate new token using data
    return jwt.sign({ userData }, process.env.JWT_SECRET, { expiresIn: 50000 });
}
module.exports = { jwtAuthmiddleware, generatetoken };