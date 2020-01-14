const express = require('express');
const cors = require('cors');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const routes = require('./routes');
const request = require('./handlers/request');

io.on('connection', socket => {
  const { headers } = socket.handshake;

  socket.join(headers.domain);
  
  socket.on('event', async data => {
    try {
      const { success, content } = await request.make(headers, data);
      return socket.to(headers.domain).emit('observer', { 
        success: success,
        content: content
      });
    } catch(err) {
      return socket.to(headers.domain).broadcast.emit('observer', { 
        success: false,
        content: 'UNSPECTED ERROR IN TUNNEL API'
      });
    }
  });
});

app.use(cors());
app.use(express.json());
app.use(routes);

server.listen(process.env.PORT || 3333);