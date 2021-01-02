const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/userRouter');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const axiox = require('axios');
const catchAsync = require('./utils/catchAsync');
const authController = require('./controllers/authController');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  );
  res.header('Access-Control-Allow-Credentials', true);
  next();
});
app.use('/api/users', userRouter);
app.get('/', (req, res) => {
  res.status(200).send('<h1>Welcome to the api</h1>');
});
app.post(
  '/api/compile',
  authController.protect,
  catchAsync(async (req, res, next) => {
    console.log('Sending Code for Compilation');
    const { script, language, versionIndex, stdin } = req.body;
    let ob = {
      script,
      language,
      versionIndex,
      clientId: process.env.clientId,
      clientSecret: process.env.clientSecret,
      stdin,
    };
    console.log(ob);
    const { data } = await axiox.post('https://api.jdoodle.com/v1/execute', ob);
    res.status(200).json({
      status: 'success',
      data,
    });
  })
);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
