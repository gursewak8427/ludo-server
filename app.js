import express from 'express';
const app = express();
import { createServer } from 'http';
const server = createServer(app);
import { Server } from "socket.io";
const io = new Server(server);

app.get('/', (req, res) => {
  res.send('hello from ludo server');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(5055 || process.env.PORT, () => {
  console.log('listening on *:5055');
});