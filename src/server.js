const express = require('express');
const cors = require('cors');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const routes = require('./routes');
const request = require('./handlers/request');

io.on('connection', socket => {
  let { headers } = socket.handshake;

  if (!headers.domain && !headers.authorization) {
    const { domain, authorization } = socket.request._query;
    
    headers = {
      domain,
      authorization
    }
  }

  // Join this new Client in Room
  socket.join(headers.domain);

  const clients = io.in(headers.domain).clients().sockets;

  if(clients.length === 0) {
    throw new Error('CLIENTS NOT FOUND');
  }

  // Send to specific Clients in Room
  socket.on('event', async data => {
    try {
      const { success, content } = await request.make(headers, data);

      if(!content.sockets || !content.sockets.clients || !content.sockets.clients.length) {
        throw new Error('SOCKET CLIENTS NOT INFORMED');
      }
      
      for (const toEmit of content.sockets.clients) {

        // If for some reasons the same Client as connected multiple times, this verification blocked extra emits.
        let sent = false;
        for (const key in clients) {
          if(!sent && clients[key].handshake.headers.authorization === toEmit) {
            clients[key].emit('observer', { 
              success: success,
              content: content
            });

            sent = true;
          }

          if(!sent && clients[key].request._query.authorization === toEmit) {
            clients[key].emit('observer', { 
              success: success,
              content: content
            });

            sent = true;
          }
        }
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

server.listen(process.env.PORT || 5555);