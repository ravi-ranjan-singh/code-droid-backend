const mongoose = require('mongoose');
const dotenv = require('dotenv');
const socketServer = require('./socket_server');
dotenv.config({
  path: './config.env',
});
const app = require('./app');

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  .then(() => {
    console.log('DATABASE CONNECTION SUCCESSFUL');
  })
  .catch((err) => {
    console.log('An error occured');
    console.log(err);
  });

const localPort = 3001;
const PORT = process.env.PORT || localPort;
const server = app.listen(PORT, () => {
  console.log('Server Listening on PORT', PORT);
});
socketServer(server);
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection shutting down..');
  server.close(() => {
    process.exit(1);
  });
});
