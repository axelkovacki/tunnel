const socketIO = require('socket.io');
const events = require('./events');

const webSockets = (server) => {
  // Start websocket server with Socket.io
  const io = socketIO(server);

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
  
    events(socket, clients)
  });
};

module.exports = webSockets;