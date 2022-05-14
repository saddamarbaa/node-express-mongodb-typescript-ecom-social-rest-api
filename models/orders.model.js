const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    email: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Please provide first name']
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }
});

mongoose.set('useFindAndModify', false);
// Compile model from schema and Exported
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
