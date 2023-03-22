const express = require('express');
const app = express();
const http = require('http');
require('./config/db.js')(); // connect to the database
// get user model
const User = require("./models/userModel")
const LiveUser = require('./models/liveUsers');
var uuid = require('uuid');

app.use(express.json())

const server = http.createServer(app);
const io = require("socket.io")(server, {
    // ...
});

// User Route
app.use("/user", require("./routes/users.js"));

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

app.post("/login", async (req, res) => {
    console.log("im here")
    const { phone, password } = req.body;
    console.log(req.body);
    const userdata = await User.findOne({ phone, password })
    console.log(userdata)
    if (userdata) {
        res.send({
            status: "1",
            message: "Login Successfully",
            userId: userdata._id
        })
    } else {

        res.send({
            status: "0",
            message: "Login Failed"
        })
    }
})

app.post("/go_live", async (req, res) => {

    try {
        const { userId } = req.body;
        const sessionId = uuid.v1();
        const userdata = await User.findOne({ _id: userId })
        if (userdata) {
            // LiveUser
            // check another user is active or not
            // means check user with anotherUser = empty string
            const anotherLiveUser = await LiveUser.findOne({ anotherUser: "" });
            if (anotherLiveUser) {
                const liveUserData = new LiveUser({ userId, sessionId: anotherLiveUser.sessionId, anotherUser: anotherLiveUser.userId, });
                anotherLiveUser.anotherUser = userId;
                await anotherLiveUser.save();
                await liveUserData.save();

                res.send({
                    status: "2",
                    message: "Go to live and connected Successfully",
                })
            } else {
                const liveUserData = new LiveUser({ userId, sessionId, anotherUser: "" });
                await liveUserData.save();


                res.send({
                    status: "1",
                    message: "Go to live and waiting... successfully",
                })
            }




        } else {
            console.log("error1")
            res.send({
                status: "0",
                message: "Go to live Failed",
            })
        }
    } catch (error) {
        console.log(error)
        res.send({
            status: "0",
            message: "Go to live Failed",
        })
    }

})

io.on('connection', (socket) => {
    console.log('a user connected');


    socket.on('s_getDiceNumber', async (data, callback) => {
        console.log("data");
        console.log(data);
        const { userId, playerId } = data;

        var min = 1;
        var max = 7;
        var rnd = Math.floor(Math.random() * (max - min)) + min;
        console.log("rnd", rnd);

        const userdata = await LiveUser.findOne({ userId: userId })
        if (userdata) {
            // get session id
            var anotherUser = userdata.anotherUser;
            const anotherUserData = await LiveUser.findOne({ userId: anotherUser })
            var anotherUserSocketId = anotherUserData.socketId;
            // send random number back to another user from the server... 1 to anther three for now only second person
            console.log("im here");
            console.log(anotherUserSocketId);
            console.log(["sending...", { success: "1", rnd: rnd, playerId: playerId }])
            io.to(anotherUserSocketId).emit("s_set_dice_number", { success: "1", rnd: rnd, playerId: playerId });
        }

        // send random number back
        callback(rnd);
    })


    socket.on('s_go_live', async (data, callback) => {
        console.log(data);
        const { userId } = data;

        const sessionId = uuid.v1();
        const userdata = await User.findOne({ _id: userId })
        if (userdata) {
            // LiveUser
            // check another user is active or not
            // means check user with anotherUser = empty string
            await LiveUser.deleteMany({ userId });
            const anotherLiveUser = await LiveUser.findOne({ anotherUser: "" });
            if (anotherLiveUser) {
                const liveUserData = new LiveUser({
                    userId,
                    sessionId: anotherLiveUser.sessionId,
                    anotherUser: anotherLiveUser.userId,
                    socketId: socket.id
                });
                anotherLiveUser.anotherUser = userId;
                await anotherLiveUser.save();
                await liveUserData.save();

                // get names with userNames
                const userdata2 = await User.findOne({ _id: anotherLiveUser.userId })

                io.to(anotherLiveUser.socketId).emit("connected_to_live", { success: "1", userDetails: ["", userdata2.username, userdata.username, ""] });

                callback({
                    status: "2",
                    message: "Go to live and connected Successfully",
                    userDetails: ["", userdata2.username, userdata.username, ""]
                })
            } else {

                const liveUserData = new LiveUser({
                    userId,
                    sessionId,
                    anotherUser: "",
                    socketId: socket.id
                });

                await liveUserData.save();


                callback({
                    status: "1",
                    message: "Go to live and waiting... successfully",
                })
            }

        } else {
            callback({
                status: "0",
                message: "Go to live Failed",
            })
        }
    })

    socket.on('s_change_player_position', async (data, callback) => {
        const { userId, playerNumber, diceNumber, nextPosition, np, finalIndex, currentIndex } = data;
        console.log(data);
        const userdata = await LiveUser.findOne({ userId: userId })
        if (userdata) {
            // get session id
            var anotherUser = userdata.anotherUser;
            const anotherUserData = await LiveUser.findOne({ userId: anotherUser })
            var anotherUserSocketId = anotherUserData.socketId;
            // send random number back to another user from the server... 1 to anther three for now only second person
            console.log("im here for change position of players");
            console.log(anotherUserSocketId);
            io.to(anotherUserSocketId).emit("s_changePlayerPositionFromServer", { success: "1", diceNumber: diceNumber, playerNumber: playerNumber, nextPosition: nextPosition, np: np, finalIndex: finalIndex, currentIndex: currentIndex });
        }
    })
    socket.on("disconnect", (_) => {
        console.log("user disconnect")
        console.log(socket.id)
    })
});

const PORT = process.env.PORT || 5052
server.listen(PORT, '192.168.134.91', () => {
    console.log('listening on 192.168.134.91:%d', PORT);
});
