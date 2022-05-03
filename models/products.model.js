// Import the mongoose module from node_modules
const mongoose = require('mongoose');

const getRandomIntNumberInBetween = require('../utils/getRandomIntNumberInBetween');

// Defining a Model and Creating a Database Schema
// define product schema
const productSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: [true, 'Please provide name'],
      maxLength: 100,
      minlength: 3,
      trim: true,
      lowercase: true
    },
    price: {
      type: String, // converted to string from number to fix typecasting issue
      required: [true, 'Please provide price'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
      maxLength: 500,
      minlength: 15,
      trim: true,
      lowercase: true
    },

    productImage: {
      type: String,
      required: [true, 'Please provide product image'],
      trim: true
    },
    addedDate: {
      type: Date,
      default: new Date()
    },
    userId: {
      // every products shuold blong to user
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // add relationship
      required: [true, 'User is required']
    },
    category: {
      type: String,
      enum: [
        "Women's clothing",
        "Men's clothing",
        "Men's Shoes",
        "Women's Shoes",
        'Toys ',
        'Football',
        'Books',
        'Personal Computers',
        'Jewelery',
        'Electronics',
        'Sports',
        'All Products'
      ],
      default: 'All Products',
      trim: true,
      required: [true, 'Category is required please select one']
    },
    stock: {
      type: String,
      required: false,
      maxLength: 50,
      minlength: 3,
      trim: true,
      lowercase: true,
      default: 'in stock - order soon'
    },
    rating: {
      type: String,
      required: false,
      maxLength: 5,
      trim: true,
      lowercase: true,
      default: getRandomIntNumberInBetween()
    },
    count: {
      type: Number,
      required: false,
      minlength: 1,
      trim: true,
      lowercase: true,
      default: getRandomIntNumberInBetween(2, 100)
    }
  },
  {
    timestamps: true
  }
);

// Compile model from schema and Exported
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
