import express from 'express';

import { createStripeCheckoutSessionValidation, isAuth } from '@src/middlewares';
import {
  captureStripePaymentController,
  createStripeCheckoutController,
  getStripePublicKeyController,
} from '@src/controllers';

const router = express.Router();

router.get('/strip-Key', isAuth, getStripePublicKeyController);
router.post('/capture-stripe-payment', isAuth, captureStripePaymentController);
router.post(
  '/create-stripe-checkout-session',
  isAuth,
  createStripeCheckoutSessionValidation,
  createStripeCheckoutController
);

export = router;
