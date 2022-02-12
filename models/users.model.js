const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Access Environment variables
const { TOKEN_SECRET, JWT_EXPIRE_TIME } = require('../configs/environment.config');

// Defining a Model and Creating a Database Schema
// define user schema
const userSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      maxLength: 15,
      minlength: 3,
      trim: true,
      lowercase: true
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      maxLength: 15,
      minlength: 3,
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      // a regular expression to validate an email address(stackoverflow)
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email'
      ],
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      maxLength: 40,
      trim: true
    },
    confirmPassword: {
      type: String,
      required: [true, 'Please provide confirmed Password'],
      minlength: 6,
      maxLength: 40,
      trim: true
    },
    dateOfBirth: {
      type: String,
      maxLength: 15,
      trim: true
    },
    gender: { type: String, trim: true, lowercase: true },
    joinedDate: {
      type: Date,
      default: new Date(),
      trim: true
    },
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // add relationship
            required: [true, 'Please provide Product']
          },
          quantity: {
            type: Number,
            required: [true, 'Please provide quantity']
          }
        }
      ]
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'admin'],
      default: 'user',
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: true
  }
);

//  Mongoose Schema Instance Methods

// Pre Save Hook. Generate hashed password
userSchema.pre('save', async function(next) {
  // Check if this is new account or password is modfied
  if (!this.isModified('password')) {
    // if the password is not modfied then continue
  } else {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, salt);
  }
});

// Create JWT token for the user
userSchema.methods.createJWT = function() {
  const payload = {
    userId: this._id,
    email: this.email
  };

  return jwt.sign(payload, TOKEN_SECRET, {
    expiresIn: JWT_EXPIRE_TIME
  });
};

// Compare passwords
userSchema.methods.comparePassword = async function(canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

// add to cart
userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

// Compile model from schema and Exported
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
