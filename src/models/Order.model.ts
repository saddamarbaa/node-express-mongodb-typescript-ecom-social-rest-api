import mongoose, { Schema } from 'mongoose';

import { OrderT } from '@src/interfaces';

export const orderSchema: Schema<OrderT> = new Schema(
  {
    products: [
      {
        product: { type: Object, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    user: {
      email: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Please provide first name'],
      },
      surname: {
        type: String,
        required: [true, 'Please provide last name'],
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compile model from schema and Exported
export default mongoose.models.Order || mongoose.model<OrderT>('Order', orderSchema);
