import express from 'express';

import healthCheckRoute from '@src/routes/healthCheck.route';
import homeRoute from '@src/routes/home.route';
import authRoutes from '@src/routes/auth.route';
import adminRoutes from '@src/routes/admin.route';
import managerRoutes from '@src/routes/manager.route';
import productsRoutes from '@src/routes/product.route';
import orderRoutes from '@src/routes/order.route';
import cartRoutes from '@src/routes/cart.route';

const router = express.Router();

router.use('/', homeRoute);
router.use('/healthChecker', healthCheckRoute);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/manager', managerRoutes);
router.use('/products', productsRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

export default router;
