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

export const createStripeCheckoutSessionService = async (
  req: AuthenticatedRequestBody<ProcessingStripeCheckoutT>,
  res: Response,
  next: NextFunction
) => {
  // stripe test card number 4242 4242 4242 4242
  const lineItems = req.body.orderItems.map((item) => {
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item?.product?.name,
          images: [`${item.product.productImage}`],
          description: item?.product?.description,
          metadata: {
            id: item?.product?._id,
          },
        },
        unit_amount: Number(item.product.price) * 100,
      },
      quantity: item.quantity,
    };
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'SG', 'KE'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Free shipping',
            // Delivers between 5-7 business days
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1500,
              currency: 'usd',
            },
            display_name: 'Next day air',
            // Delivers in exactly 1 business day
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 1,
              },
            },
          },
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: `${environmentConfig.WEBSITE_URL}/checkout-success`,
      cancel_url: `${environmentConfig.WEBSITE_URL}/checkout`,
    });

    const data = {
      url: session.url,
    };

    // res.redirect(303, session.url);
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
    return next(error);
  }
};
