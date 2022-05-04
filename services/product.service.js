const { validationResult } = require('express-validator');

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
