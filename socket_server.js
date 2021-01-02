const socketServer = (server) => {
  const io = require('socket.io')(server);

  io.on('connection', (socket) => {
    console.log('client connected');
    socket.on('join', (room) => {
      console.log('joined', room);
      socket.join(room);
    });
    socket.on('new-code', ({ code, room }) => {
      socket.to(room).broadcast.emit('new-code', code);
    });
    socket.on('stdin', ({ inputs, room }) => {
      socket.to(room).broadcast.emit('stdin', inputs);
    });
    socket.on('stdout', ({ output, room }) => {
      socket.to(room).broadcast.emit('stdout', output);
    });
    socket.on('lang-change', ({ value, room }) => {
      socket.to(room).broadcast.emit('lang-change', value);
    });
    socket.on('typing', ({ name, room }) => {
      socket.to(room).emit('typing', name);
    });
  });
};

module.exports = socketServer;
