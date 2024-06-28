const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

//Define schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
    aadhareCardNumber: {
        required: true,
        type: Number,
        unique: true

    },
    password: {
        required: true,
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'voter'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});

userSchema.pre('save', async function(next) {
    const person = this;
    if (!person.isModified('password')) next();
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(person.password, salt);
        person.password = hashedPassword;
        next();

    } catch (error) {
        return next(error);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;


    } catch (error) {
        throw error;
    }
}



const User = mongoose.model('User', userSchema);
module.exports = User;