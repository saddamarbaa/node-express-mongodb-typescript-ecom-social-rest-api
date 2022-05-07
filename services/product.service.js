const { validationResult } = require('express-validator');

const User = require('../models/users.model');
const Product = require('../models/products.model');

const Response = require('../utils/response');
const { WEBSITE_URL, API_VERSION } = require('../configs/environment.config');

/**
 * @desc    Get all products
 * @route   GET /api/v1/products
 * @access  Public
 */

exports.getProducts = (req, res) => {
  const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;

  const responseObject = {
    totalDocs: totalDocs || 0,
    totalPages: totalPages || 0,
    lastPage: lastPage || 0,
    count: results?.length || 0,
    currentPage: currentPage || 0
  };

  if (next) {
    responseObject.nextPage = next;
  }
  if (previous) {
    responseObject.prevPage = previous;
  }

  responseObject.products = results.map(doc => {
    // Pass more information  with response
    return {
      name: doc?.name,
      price: doc?.price,
      _id: doc?._id,
      description: doc?.description,
      category: doc?.category,
      productImage: doc?.productImage,
      count: doc?.count,
      rating: doc?.rating,
      stock: doc?.stock,
      addedDate: doc?.addedDate,
      createdAt: doc?.createdAt,
      updatedAt: doc?.updatedAt,
      user: doc?.userId,
      request: {
        type: 'Get',
        description: 'Get one product with the id',
        url: `${WEBSITE_URL}/api/${API_VERSION}/products/${doc._id}`
      }
    };
  });

  return Response(responseObject, true, false, 'Successful Found products', 200);
};

/**
 * @desc      Get product
 * @route     Get /api/v1/products/productId
 * @access    Private
 */

exports.getProduct = async (req, res, next) => {
  let responseObject = {};
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      productId: req.params.productId
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    // Product.update({}, { $set: { numberOfViewsPerWeek: 0 } }, { multi: true }, function(error, properties) {
    //   if (error) {
    //     console.log(error);
    //   }

    //   if (!properties) {
    //     console.log('Something went wrong');
    //   }

    //   console.log('success update view');
    // });

    const doc = await Product.findById(req.params.productId);
    if (!doc) {
      return Response([], false, true, `Failed to find product by given ID ${req.params.productId}`, 400);
    }

    const data = {
      product: {
        name: doc?.name,
        price: doc?.price,
        _id: doc?._id,
        description: doc?.description,
        category: doc?.category,
        productImage: doc?.productImage,
        count: doc?.count,
        rating: doc?.rating,
        stock: doc?.stock,
        addedDate: doc?.addedDate,
        createdAt: doc?.createdAt,
        updatedAt: doc?.updatedAt,
        user: doc?.userId,
        request: {
          type: 'Get',
          description: 'Get all the products',
          url: `${WEBSITE_URL}/api/${API_VERSION}/products`
        }
      }
    };

    return Response(data, true, false, `Successfully Found product by given id: ${req.params.productId}`, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     add product to cart
 * @route    Post /api/v1/products/cart
 * @access   Private
 */

exports.postAddToCart = async (req, res, next) => {
  let responseObject = {};
  const productId = req.body.productId;
  const errors = validationResult(req);
  const doDecrease = req.query.decrease === 'true' ? true : false;

  // console.log(req.query.decrease);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg,
      responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      productId: productId
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return Response([], false, true, `Failed to find product by given ID ${productId})`, 400);
    }

    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(401).send(Response({}, false, true, 'Auth Failed (Invalid Credentials)', 401));
    }

    const updatedUser = await user.addToCart(productId, doDecrease);

    const data = {
      user: updatedUser
    };

    return Response(data, true, false, `Successfully added product to cart: ${productId}`, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     get user cart
 * @route    get /api/v1/products/cart
 * @access   Private
 */

exports.getCart = async (req, res, next) => {
  try {
    const userCart = await User.findById(req.user.userId)
      .select('cart')
      .populate('cart.items.productId')
      .exec();

    if (!userCart) {
      return res.status(401).send(Response({}, false, true, 'Auth Failed', 401));
    }

    const data = {
      products: userCart.cart.items,
      userId: userCart._id
    };

    return Response(data, true, false, `Successfully found cart:`, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     remove product From Cart
 * @route    Post /api/v1/products/cart-delete-item
 * @access   Private
 */

exports.postCartDeleteProduct = async (req, res, next) => {
  let responseObject = {};
  const productId = req.body.productId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg,
      responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      productId: productId
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return Response([], false, true, `Failed to find product by given ID ${productId})`, 400);
    }

    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(401).send(Response({}, false, true, 'Auth Failed (Invalid Credentials)', 401));
    }

    const updatedUser = await user.removeFromCart(productId);
    // console.log("updatedUser",updatedUser)

    const data = {
      user: updatedUser
    };

    return Response(data, true, false, `Successfully Removed items : ${productId} from Cart`, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     clear cart
 * @route    Delete /api/v1/products/clear-cart
 * @access   Private
 */

exports.clearCart = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(401).send(Response({}, false, true, 'Auth Failed (Invalid Credentials)', 401));
    }

    const updatedUser = await user.clearCart();
    const data = {
      user: updatedUser
    };

    return Response(data, true, false, `Successfully  Cleared cart`, 200);
  } catch (error) {
    return next(error);
  }
};
