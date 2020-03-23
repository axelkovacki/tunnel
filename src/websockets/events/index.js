const request = require('../../handlers/request');

const events = (socket, clients) => {
  // Send to specific Clients in Room
  socket.on('event', async data => {
    try {
      const { success, content } = await request.make(headers, data);

      if(!content.sockets || !content.sockets.clients || !content.sockets.clients.length) {
        throw new Error('SOCKET CLIENTS NOT INFORMED');
      }
      
      for (const toEmit of content.sockets.clients) {
        for (const key in clients) {
          if(clients[key].handshake.headers.authorization === toEmit) {
            clients[key].emit('observer', { 
              success: success,
              content: content
            });
          }

          if(clients[key].request._query.authorization === toEmit) {
            clients[key].emit('observer', { 
              success: success,
              content: content
            });
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
};

module.exports = events;