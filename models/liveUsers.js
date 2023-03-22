const mongoose = require('mongoose');

const LiveUsersSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    sessionId: {
        type: String,
    },
    anotherUser: {
        type: String,
    },
    socketId: {
        type: String,
    },
});

module.exports = LiveUser = mongoose.model('live_user', LiveUsersSchema);