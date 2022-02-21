const mongoose = require('mongoose');
const crypto = require('crypto');

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    resetPasswordToken: {
      type: String,
      required: false
    },
    resetPasswordExpires: {
      type: Date,
      required: false
    },
    emailVerificationToken: {
      type: String,
      required: false
    },
    emailVerificationExpiresToken: {
      type: Date,
      required: false
    }
  },

  { timestamps: true }
);

// Generate Password Reset
tokenSchema.methods.generatePasswordReset = function() {
  this.resetPasswordToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

// Generate email verification token
tokenSchema.methods.generateEmailVerificationToken = function() {
  this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationExpiresToken = Date.now() + 3600000; //expires in an hour
};

// Compile model from schema and Exported
module.exports = mongoose.models.Token || mongoose.model('Token', tokenSchema);
