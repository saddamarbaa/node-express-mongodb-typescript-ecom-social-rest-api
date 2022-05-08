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
      trim: true,
      lowercase: true,
      required: [true, 'Please provide first name'],
      maxLength: [3, "Name can't be smaller than 2 characters"],
      maxLength: [15, "Name can't be greater than 64 characters"]
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      maxLength: 15,
      minlength: 3,
      trim: true,
      lowercase: true
    },
    familyName: {
      type: String,
      required: false,
      trim: true,
      minlength: [3, "Name can't be smaller than 3 characters"],
      maxLength: [30, "Name can't be greater than 30 characters"],
      lowercase: true
    },
    companyName: {
      type: String,
      required: false,
      trim: true,
      minlength: [3, "Company Name can't be smaller than 3 characters"],
      maxLength: [30, "Company Name can't be greater than 30 characters"],
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
      unique: false,
      trim: true,
      lowercase: true,
      maxLength: [128, "Email can't be greater than 128 characters"],
      index: false
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      trim: true
    },
    confirmPassword: {
      type: String,
      required: [true, 'Please provide confirmed Password'],
      minlength: 6,
      trim: true
    },
    dateOfBirth: {
      type: String,
      maxLength: 15,
      trim: true
    },
    mobileNumber: {
      type: String,
      required: false,
      unique: true,
      // maxLength: [50, "mobileNumber can't be greater than 15 characters"],
      // match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please provide a valid number'],
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
      trim: true,
      lowercase: true,
      enum: ['user', 'guide', 'admin'],
      default: 'user'
    },
    profileImage: {
      type: String,
      required: false,
      default: '/static/uploads/users/temp.png',
      lowercase: true
    },
    favoriteAnimal: {
      type: String,
      required: false,
      trim: true,
      minlength: [3, "Favorite Animal can't be smaller than 3 characters"],
      maxLength: [35, "Favorite Animal can't be greater than 15 characters"],
      lowercase: true
    },
    nationality: {
      type: String,
      trim: true,
      required: false,
      lowercase: true
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'active'],
      default: 'pending',
      required: false,
      trim: true,
      lowercase: true
    },
    bio: {
      type: String,
      required: false,
      trim: true,
      minlength: [10, "Bio can't be smaller than 10 characters"],
      maxLength: [300, "Bio can't be greater than 300 characters"],
      lowercase: true
    },
    jobTitle: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      minlength: [3, "Job Title can't be smaller than 3 characters"],
      maxLength: [30, "Job Title can't be greater than 15 characters"]
    },
    address: {
      type: String,
      required: false,
      trim: true,
      lowercase: true
    },
    acceptTerms: { type: Boolean, required: false, default: false },
    confirmationCode: {
      type: String,
      unique: true,
      required: false
    },
    resetPasswordToken: {
      type: String,
      required: false
    },
    resetPasswordExpires: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
);

//  Mongoose Schema Instance Methods

/**
 * Pre Save Hook. Generate hashed password
 */
userSchema.pre('save', async function(next) {
  const user = this;

  // Check if this is new account or password is modfied
  if (!user.isModified('password')) {
    return next();
    // if the password is not modfied then continue
  } else {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    user.confirmPassword = await bcrypt.hash(user.confirmPassword, salt);
  }

  // commented code blow will do the same
  /*
    Here first checking if the document is new by using a helper of mongoose .isNew, therefore, this.isNew is true if document is new else false, and we only want to hash the password if its a new document, else  it will again hash the password if you save the document again by making some changes in other fields incase your document contains other fields.
    */

  //   try {
  //     if (this.isNew) {
  //       const salt = await bcrypt.genSalt(12);
  //       user.password = await bcrypt.hash(user.password, salt);
  //       user.confirmPassword = await bcrypt.hash(user.confirmPassword, salt);
  //     }
  //     next();
  //   } catch (error) {
  //     next(error);
  //   }
  // });
});

// After Save Hook.
userSchema.post('save', function(doc) {
  console.log('User is been Save ', this);
});

/**
 * Create JWT token for the user
 */
userSchema.methods.createJWT = function() {
  const payload = {
    userId: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    role: this.role
  };

  return jwt.sign(payload, TOKEN_SECRET, {
    expiresIn: JWT_EXPIRE_TIME
  });
};

/**
 * Compare passwords
 */
userSchema.methods.comparePassword = async function(canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

/**
 * Add to cart
 */
userSchema.methods.addToCart = function(prodId, doDecrease) {
  let cartProductIndex = -1;
  let updatedCartItems = [];

  if (this.cart.items) {
    cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === prodId.toString();
    });
    updatedCartItems = [...this.cart.items];
  }

  let newQuantity = 1;
  if (cartProductIndex >= 0) {
    let newQuantity;
    if (doDecrease) {
      newQuantity = this.cart.items[cartProductIndex].quantity - 1;
      if (newQuantity <= 0) {
        return this.removeFromCart(prodId);
      }
    } else {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    }
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: prodId,
      quantity: newQuantity
    });
  }

  const updatedCart = {
    items: updatedCartItems
  };

  this.cart = updatedCart;
  return this.save();
};

/**
 * Remove Items From Cart
 */

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

/**
 * clear all Cart
 */

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

mongoose.set('useFindAndModify', false);
// Compile model from schema and Exported
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
