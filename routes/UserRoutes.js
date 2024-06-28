const express = require('express')
const router = express.Router();
const { jwtAuthmiddleware, generatetoken } = require('./../jwt')
const User = require('./../model/user');

router.post('/signup', async(req, res) => {
    try {
        const data = req.body

        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Validate Aadhar Card Number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }

        // Check if a user with the same Aadhar Card Number already exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }

        const newUser = new User(data);

        const response = await newUser.save();
        console.log('data saved');

        //payload
        const payload = {
            id: response.id
        }

        //token
        const token = generatetoken(payload)
        console.log("token :", token);

        res.status(200).json({ response: response, token: token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal server error" })
    }
})

router.post('/login', async(req, res) => {
    try {
        const { aadhareCardNumber, password } = req.body;
        const user = await User.findOne({ aadhareCardNumber: aadhareCardNumber });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid username or password" })
        }

        //generate token
        const payload = {
            id: user.id
        }
        const token = generatetoken(payload);

        res.json({ token })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal server error" })
    }
})

router.get('/profile', jwtAuthmiddleware, async(req, res) => {
    try {
        const userData = req.user;
        console.log("user Data:", userData);

        const userId = userData.userData.id;
        console.log(userId)
        const user = await User.findById(userId);
        res.status(200).json({ user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" })
    }
})



//update through email
router.put('/profile/password', async(req, res) => {
    try {
        const userId = req.user.id; // extrect the email
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(userId)
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: "Invalid username or password" })
        }

        user.password = newPassword;
        await user.save();
        console.log("password updated")
        res.status(200).json({ message: 'password updated' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal error" })

    }
})



module.exports = router;