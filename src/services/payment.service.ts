import { NextFunction, Response } from 'express';
import createHttpError from 'http-errors';

import Stripe from 'stripe';
import { customResponse } from '@src/utils';
import { environmentConfig } from '@src/configs';
import { AuthenticatedRequestBody, IUser, ProcessingStripeCheckoutT } from '@src/interfaces';

const stripe = new Stripe(environmentConfig.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  appInfo: {
    // For sample support and debugging, not required for production:
    name: 'stripe-samples/accept-a-payment',
    url: 'https://github.com/stripe-samples',
    version: '0.0.2',
  },
  typescript: true,
});

export const getStripePublicKeyService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = {
      stripeKey: environmentConfig.STRIPE_PUBLIC_KEY,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Success`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(createHttpError.InternalServerError);
  }
};

export const captureStripePaymentService = async (req: any, res: Response, next: NextFunction) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body?.amount,
      currency: 'usd',
      // currency: 'usd',

      // optional
      metadata: { integration_check: 'accept_a_payment' },
    });

    const data = {
      client_secret: paymentIntent.client_secret,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Success`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(createHttpError.InternalServerError);
  }
};
