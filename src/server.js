const express = require('express');
const cors = require('cors');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const routes = require('./routes');
const request = require('./handlers/request');

io.on('connection', socket => {
  const { headers } = socket.handshake;

  // Join this new Client in Room
  socket.join(headers.domain);

  const clients = io.in(headers.domain).clients().sockets;

  if(clients.length === 0) {
    throw new Error('CLIENTS NOT FOUND');
  }

  // Send to specifcs Clients in Room
  socket.on('event', async data => {
    try {
      const { success, content } = await request.make(headers, data);

      if(!content.sockets || !content.sockets.clients) {
        throw new Error('SOCKET CLIENTS NOT INFORMED');
      }

      for (const key in clients) {
        const toEmit = content.sockets.clients.filter((a) => a.authorization === clients[key].handshake.headers.authorization);

        if(toEmit.length === 0) {
          throw new Error('CLIENTS NOT FOUND');
        }

        toEmit.forEach((a) => {
          a.emit('observer', { 
            success: success,
            content: content
          });
        });
      }

    } catch(err) {
      console.log(err)
      return socket.to(headers.domain).broadcast.emit('observer', { 
        success: false,
        content: 'UNSPECTED ERROR IN TUNNEL API'
      });
    }
  });

  // Send to all Clients in Room
  socket.on('event_broadcast', async data => {
    try {
      const { success, content } = await request.make(headers, data);

      return socket.to(headers.domain).broadcast.emit('observer_broadcast', { 
        success: success,
        content: content
      });

    } catch(err) {
      return socket.to(headers.domain).broadcast.emit('observer_broadcast', { 
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