const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    },
    wallet: {
        type: Number,
        default: 0
    }
});

module.exports = User = mongoose.model('user', UserSchema);