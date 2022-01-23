const mongoose = require('mongoose');

const Order = require('../models/order.model');
const Product = require('../models/products.model');

// Handling Get Request to /orders
exports.orders_get_all = (req, res, next) => {
  // find all the orders
  Order.find()
    .select('quantity product _id')
    .populate('product', 'name') // populate return merge result
    .exec() // .exec() method return promise
    .then((docs) => {
      // pass more information  with response
      const responseObject = {
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            _id: doc._id,
            quantity: doc.quantity,
            product: doc.product,
            request: {
              type: 'Get',
              description: 'Get one order with the id',
              url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/orders/${doc._id}`,
            },
          };
        }),
      };
      return res.status(200).send({
        success: true,
        message: 'Successful Found all orders',
        status: 200,
        result: responseObject,
      });
    })
    .catch((error) => {
      res.status(404).send({
        message: 'Order by given id not found',
        error: error,
      });
    });
};

// Handling Post Request to /order
exports.orders_create_order = (req, res, next) => {
  // Validated the product in DB first
  Product.findById(req.body.productId)
    .exec()
    .then((product) => {
      // if product is null
      if (product === null) {
        return res.status(404).send({
          message: 'Product is not found to be ordered',
          status: 404,
          success: false,
        });
      }

      // Create new order
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });

      // save the order
      order
        .save()
        .then((result) => {
          // HTTP Status 201 indicates that as a result of HTTP POST  request,
          //  one or more new resources have been successfully created on server
          res.status(201).send({
            message: 'Order Successfully Stored',
            success: true,
            status: 201,
            CreatedOrderObject: {
              quantity: result.quantity,
              product: product,
              _id: result._id,
              request: {
                type: 'Get',
                description: 'Get one order with the id',
                url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/orders/${result._id}`,
              },
            },
          });
        })
        .catch((error) => {
          // 500 Internal Server Error
          res.status(500).send({
            message: 'unable to save to database',
            success: false,
            status: 500,
            error: error,
          });
        });
    })
    .catch((error) => {
      res.status(404).send({
        message: 'Product by given id not found to be ordered',
        error: error,
        status: 404,
        success: false,
      });
    });
};

// Handling individual Request to /orders/ID
exports.orders_get_one_order = (req, res, next) => {
  const id = req.params.orderId;

  Order.findById(id)
    .populate('product') // populate all product information
    .select('name price _id')
    .exec() // .exec() method return promise
    .then((docs) => {
      if (docs) {
        res.status(200).send({
          message: 'Successfully Found the order by given id',
          success: true,
          status: 200,
          order: {
            quantity: docs.quantity,
            product: docs.product,
            _id: docs._id,
            request: {
              type: 'Get',
              description: 'Get all the order',
              url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/products`,
            },
          },
        });
      } else {
        // if the id is not found in db it return null
        res.status(404).send({
          message: 'no valid entry found for provided ID',
          success: false,
          status: 400,
        });
      }
    })
    .catch((error) => {
      // 500 Internal Server Error
      res.status(500).send({
        message: 'Internal Server Error(invalid id)',
        success: false,
        status: 500,
        error: error,
      });
    });
};

// Handling deleting individual order/ID
exports.orders_delete_order = (req, res, next) => {
  const id = req.params.orderId;
  // also we can use remove
  Order.deleteOne({ _id: id })
    .exec() // .exec() method return promise
    .then((docs) => {
      if (docs) {
        res.status(200).send({
          message: 'Successfully deleted the order',
          request: {
            type: 'Post',
            description: 'You can post new order',
            url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/orders`,
            data: {
              quantity: 'number',
              product: 'mongoose.Types.ObjectId',
            },
          },
        });
      }
    })
    .catch((error) => {
      // 500 Internal Server Error
      res.status(500).send({
        message: 'Internal Server Error(invalid id)',
        success: false,
        status: 500,
        error: error,
      });
    });
};
