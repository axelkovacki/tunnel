const cors = require('cors');
const express = require('express');
const http = require('http');
const routes = require('./routes');
const webSockets = require('./websockets');

// Start Express http framework
const app = express();
const server = http.Server(app);

// Start the listeners from Websockets
webSockets(server);

app.use(cors());
app.use(express.json());
app.use(routes);

server.listen(process.env.PORT || 5555);