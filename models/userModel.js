const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      required: [true, 'Email is required'],
      validate: [validator.isEmail, 'Enter a valid Email'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'A user must have a Name name'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minlength: [8, 'A password should be minimum 8 character length'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Confirm Password is Required'],
      validate: {
        validator: function (el) {
          return el == this.password;
        },
        message: 'Password and Confirm Password are not the same.',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    writeConcern: {
      j: true,
      wtimeout: 1000,
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 100000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('users', userSchema);

module.exports = User;
