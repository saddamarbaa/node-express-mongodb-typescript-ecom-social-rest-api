import express from 'express';

import healthCheckRoute from '@src/routes/healthCheck.route';
import homeRoute from '@src/routes/home.route';
import authRoutes from '@src/routes/auth.route';
import userRoutes from '@src/routes/user.route';
import adminRoutes from '@src/routes/admin.route';
import managerRoutes from '@src/routes/manager.route';
import productRoutes from '@src/routes/product.route';
import orderRoutes from '@src/routes/order.route';
import cartRoutes from '@src/routes/cart.route';
import moderatorRoutes from '@src/routes/moderator.route';
import pdfServeRoute from '@src/routes/pdfDoc.route';
import paymentRoute from '@src/routes/payment.route';
import feedRoute from '@src/routes/feed.route';

const router = express.Router();

router.use('/', homeRoute);
router.use('/pdf-test', pdfServeRoute);
router.use('/healthChecker', healthCheckRoute);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/manager', managerRoutes);
router.use('/moderator', moderatorRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payment', paymentRoute);
router.use('/feed', feedRoute);

export default router;
