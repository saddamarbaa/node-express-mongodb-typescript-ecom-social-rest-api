import bcrypt from 'bcrypt';
import mongoose, { Schema, Document, model, models } from 'mongoose';
import jwt from 'jsonwebtoken';

import { environmentConfig } from '@src/configs/custom-environment-variables.config';
import { CartItemT, IUser } from '@src/interfaces';
import { authorizationRoles } from '@src/constants';

export interface IUserDocument extends Document, IUser {
  // document level operations
  comparePassword(password: string): Promise<boolean>;
  createJWT(): Promise<void>;
  clearCart(): Promise<void>;
  addToCart(prodId: string, doDecrease: boolean): Promise<boolean>;
  removeFromCart(prodId: string): Promise<void>;
}

const UserSchema: Schema<IUserDocument> = new Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Please provide name'],
      minLength: [3, "Name can't be smaller than 3 characters"],
      maxLength: [15, "Name can't be greater than 15 characters"],
    },
    surname: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Please provide surname'],
      minLength: [3, "Surname can't be smaller than 3 characters"],
      maxLength: [15, "Surname can't be greater than 15 characters"],
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      // a regular expression to validate an email address(stackoverflow)
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: false,
      trim: true,
      lowercase: true,
      maxLength: [128, "Email can't be greater than 128 characters"],
      index: false,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: [6, 'Password must be more than 6 characters'],
      trim: true,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Please provide confirmed Password'],
      minlength: [6, 'Password must be more than 6 characters'],
      trim: true,
      select: false,
    },
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // add relationship
            required: [true, 'Please provide Product'],
          },
          quantity: {
            type: Number,
            required: [true, 'Please provide quantity'],
          },
        },
      ],
    },
    companyName: {
      type: String,
      required: false,
      trim: true,
      minlength: [3, "Company Name can't be smaller than 3 characters"],
      maxLength: [30, "Company Name can't be greater than 30 characters"],
      lowercase: true,
    },
    dateOfBirth: {
      type: String,
      maxLength: 15,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: false,
      maxLength: [18, "mobileNumber can't be greater than 18 characters"],
      // match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please provide a valid number'],
      trim: true,
    },
    gender: { type: String, trim: true, lowercase: true },
    profileImage: {
      type: String,
      required: true,
      // default: '/static/uploads/users/temp.png',
      // lowercase: true,
    },
    cloudinary_id: {
      type: String,
    },
    role: {
      type: String,
      trim: true,
      lowercase: true,
      enum: [
        authorizationRoles.user,
        authorizationRoles.admin,
        authorizationRoles.manger,
        authorizationRoles.moderator,
        authorizationRoles.supervisor,
        authorizationRoles.guide,
        authorizationRoles.client,
      ],
      default: authorizationRoles.user,
    },
    favoriteAnimal: {
      type: String,
      required: false,
      trim: true,
      minlength: [3, "Favorite Animal can't be smaller than 3 characters"],
      maxLength: [35, "Favorite Animal can't be greater than 15 characters"],
      lowercase: true,
    },
    nationality: {
      type: String,
      trim: true,
      required: false,
      lowercase: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'active'],
      default: 'active',
      required: false,
      trim: true,
      lowercase: true,
    },
    bio: {
      type: String,
      required: false,
      trim: true,
      minlength: [10, "Bio can't be smaller than 10 characters"],
      maxLength: [300, "Bio can't be greater than 300 characters"],
      lowercase: true,
    },
    jobTitle: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      minlength: [2, "Job Title can't be smaller than 3 characters"],
      maxLength: [30, "Job Title can't be greater than 15 characters"],
    },
    address: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    acceptTerms: { type: Boolean, required: false, default: false },
    confirmationCode: { type: String, require: false, index: true, unique: true, sparse: true },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

UserSchema.pre('save', async function (next) {
  if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
    console.log('Middleware called before saving the user is', this);
  }

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    user.confirmPassword = await bcrypt.hash(user.password, salt);
  }
  next();
});

UserSchema.post('save', function () {
  if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
    console.log('Middleware called after saving the user is (User is been Save )', this);
  }
});

UserSchema.methods.createJWT = function () {
  const payload = {
    userId: this._id,
    email: this.email,
    name: this.firstName,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    role: this.role,
  };

  return jwt.sign(payload, environmentConfig.TOKEN_SECRET as string, {
    expiresIn: environmentConfig.JWT_EXPIRE_TIME,
  });
};

UserSchema.methods.addToCart = function (prodId: string, doDecrease: boolean) {
  let cartProductIndex = -1;
  let updatedCartItems: CartItemT[] = [];

  if (this.cart.items) {
    cartProductIndex = this.cart.items.findIndex((cp: { productId: { toString: () => string } }) => {
      return cp.productId.toString() === prodId.toString();
    });
    updatedCartItems = [...this.cart.items];
  }

  let newQuantity = 1;
  if (cartProductIndex >= 0) {
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
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;
  return this.save({ validateBeforeSave: false });
};

UserSchema.methods.removeFromCart = function (productId: string) {
  const updatedCartItems = this.cart.items.filter((item: { productId: { toString: () => string } }) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save({ validateBeforeSave: false });
};

UserSchema.methods.clearCart = async function (): Promise<boolean> {
  this.cart = { items: [] };
  return this.save({ validateBeforeSave: false });
};

export default models.User || model<IUserDocument>('User', UserSchema);
