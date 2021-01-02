const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDublicateFieldDB = (err) => {
  const value = err.message.match(/([""])(\\?.)*?\1/)[0];
  message = `Dublicate field value: ${value} .Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  console.log(err);
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Authentication Failed .Please log in again', 401);

const handleJWTExpiresError = () =>
  new AppError('Session Expired. Please log in again', 401);

const sendErrProd = (err, res) => {
  console.error('ERROR HERE', err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: 'Something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { ...err };
  error.message = error.message || err.message;
  if (error.code == 11000) error = handleDublicateFieldDB(error);
  if (error._message === 'users validation failed')
    error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiresError();
  sendErrProd(error, res);
};
