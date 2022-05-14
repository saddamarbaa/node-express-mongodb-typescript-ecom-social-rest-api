const User = require('../models/users.model');
const Order = require('../models/orders.model');
const Response = require('../utils/response');

/**
 * @desc     add product to orders list
 * @route    Post /api/v1/products/orders
 * @access   Private
 */

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user.userId });

    const transformedProducts = orders.map(item => {
      return {
        quantity: item.products[0].quantity,
        productId: item.products[0].product
      };
    });

    const data = {
      products: transformedProducts
    };

    return Response(data, true, false, `Successful Found all your orders`, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     add product to orders list
 * @route    Post /api/v1/orders
 * @access   Private
 */

exports.postOrder = async (req, res, next) => {
  try {
    const authUser = await User.findById(req.user.userId);
    if (!authUser) {
      return Response({}, false, true, `Auth Failed`, 401);
    }

    const userCart = await User.findById(req.user.userId)
      .select('cart')
      .populate('cart.items.productId')
      .exec();

    if (!userCart) {
      return Response({}, false, true, `Auth Failed`, 401);
    }

    if (userCart.cart.items.length <= 0) {
      return Response({}, false, true, `Oder Failed (your cart is empty)`, 422);
    }

    const orderItems = userCart.cart.items.map(item => {
      return { quantity: item.quantity, product: { ...item.productId._doc } };
    });

    // Create new order
    // Assuming (name,email,phone,address) will be coming in req.body
    const order = new Order({
      user: {
        // name: req.body.name,
        // email: req.body.email,
        // phone: req.body.phone,
        // address: req.body.address,
        firstName: authUser.familyName,
        lastName: authUser.lastName,
        email: authUser.email,
        phone: authUser.mobileNumber,
        address: authUser.address,
        userId: userCart._id
      },
      products: orderItems
    });

    // Save the order
    const beenOrderItem = await order.save();

    // Clear the cart
    const updatedCart = await authUser.clearCart();

    const data = {
      products: []
    };

    return Response(data, true, false, `Thank you, your orders will be shipped in 2-3 business days`, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     clear orders list
 * @route    Delete /api/v1/orders/clear-orders
 * @access   Private
 */

exports.clearOrders = async (req, res, next) => {
  try {
    // Delete complete Order collection
    // const dropCompleteCollection = await Order.deleteMany({});
    const dropCompleteCollection = await Order.deleteMany({ 'user.email': req.user.email });

    if (dropCompleteCollection.deletedCount === 0) {
      return Response([], false, true, `Failed to Cleared orders`, 400);
    }

    return Response([], true, false, `Successful Cleared all orders`, 200);
  } catch (error) {
    return next(error);
  }
};
