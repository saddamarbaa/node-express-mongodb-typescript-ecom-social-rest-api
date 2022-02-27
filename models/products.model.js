// Import the mongoose module from node_modules
const mongoose = require('mongoose');

// Defining a Model and Creating a Database Schema
// define product schema
const productSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: [true, 'Please provide name'],
      maxLength: 50,
      minlength: 3,
      trim: true,
      lowercase: true
    },
    price: {
      type: Number,
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
    }
  },
  {
    timestamps: true
  }
);

// Compile model from schema and Exported
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
