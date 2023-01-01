import mongoose, { Schema } from 'mongoose';

import { OrderT } from '@src/interfaces';
import { orderStatus } from '@src/constants';

export const orderSchema: Schema<OrderT> = new Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phoneNo: {
        type: String,
        required: true,
        trim: true,
      },
      status: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      street: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
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
    orderItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        quantity: { type: Number, required: true },
      },
    ],
    paymentInfo: {
      type: String,
      required: true,
    },
    textAmount: {
      type: Number,
      required: true,
    },
    shippingAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        orderStatus.cancelled,
        orderStatus.completed,
        orderStatus.delivered,
        orderStatus.pending,
        orderStatus.shipped,
        orderStatus.waitingPayment,
        orderStatus.waitingPickup,
      ],
      default: orderStatus.pending,
      trim: true,
      message: `Please select status only from short listed option (${orderStatus.pending},
        ${orderStatus.waitingPickup},
          ${orderStatus.waitingPayment},
          ${orderStatus.shipped},
          ${orderStatus.delivered},
          ${orderStatus.completed},
          ${orderStatus.cancelled},
        )`,
    },
    deliveredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compile model from schema and Exported
export default mongoose.models.Order || mongoose.model<OrderT>('Order', orderSchema);
