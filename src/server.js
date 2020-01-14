const express = require('express');
const cors = require('cors');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const routes = require('./routes');

io.on('connection', socket => {
  console.log(socket)
  socket.emit('previusMessage', 'messages');

  socket.on('newMessage', async data => {
    socket.broadcast.emit('receivedMessage', 'messages');
  });
});

app.use(cors());
app.use(express.json());
app.use(routes);

server.listen(process.env.PORT || 3333);