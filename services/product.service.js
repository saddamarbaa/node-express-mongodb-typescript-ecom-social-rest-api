const mongoose = require('mongoose');

const Response = require('../utils/response');

const Product = require('../models/products.model');
const { WEBSITE_URL, API_VERSION } = require('../configs/environment.config');

/**
 * @desc    Get all products
 * @route   GET /api/v1/products
 * @access  Public
 */

exports.getProducts = (req, res, next) => {
  Product.find()
    .select('name price _id productImage addedDate')
    .populate('userId', 'lastName lastName email dateOfBirth gender joinedDate cart') // populate return merge result
    .sort({ addedDate: -1 }) // sorted the product
    .exec() // .exec() method return promise
    .then(docs => {
      // pass more information  with response
      const data = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            productImage: doc?.productImage,
            name: doc?.name,
            price: doc?.price,
            _id: doc?._id,
            addedDate: doc?.addedDate,
            user: doc?.userId,
            createdAt: doc?.createdAt,
            updatedAt: doc?.updatedAt,
            request: {
              type: 'Get',
              description: 'Get one product with the id',
              url: `${WEBSITE_URL}/api/${API_VERSION}/products/${doc._id}`
            }
          };
        })
      };

      return Response(data, true, false, `Successful Found all products`, 200);
    })
    .catch(error => {
      return next(error);
    });
};

// // Handling Post Request to /product
// exports.products_create_product = async (req, res, next) => {
//   const productImage = req.file;
//   const name = req.body.name;
//   const price = req.body.price;
//   const isValidImage = getImageExtension(req?.file?.mimetype);
//   const userId = req?.user?.userId;

//   console.log('req.file', req.file);
//   console.log(req.body);
//   if (!productImage || !isValidImage) {
//     return res.status(400).send({
//       message: 'Please upload product image and must be vaild Image type (png / jpg /jpeg / webp)',
//       success: false,
//       status: 400
//     });
//   } else if (!name) {
//     return res.status(400).send({
//       message: 'Please provide product name',
//       success: false,
//       status: 400
//     });
//   } else if (!price) {
//     return res.status(400).send({
//       message: 'Please provide price',
//       success: false,
//       status: 400
//     });
//   }

//   const givenProduct = new Product({
//     _id: new mongoose.Types.ObjectId(),
//     name: req.body.name,
//     price: req.body.price,
//     productImage: `/static/uploads/${req.file.filename}`,
//     addedDate: `${Date.now()}`,
//     userId: userId
//   });

//   try {
//     const createdAndReturnedProduct = await Product.create(givenProduct);

//     // HTTP Status 201 indicates that as a result of HTTP POST  request,
//     //  one or more new resources have been successfully created on server
//     res.status(201).send({
//       message: 'Created Product Successfully',
//       success: true,
//       status: 201,
//       createdProduct: {
//         name: createdAndReturnedProduct.name,
//         price: createdAndReturnedProduct.price,
//         productImage: createdAndReturnedProduct.productImage,
//         _id: createdAndReturnedProduct._id,
//         addedDate: createdAndReturnedProduct.addedDate,
//         user: {
//           firstName: req.user.firstName,
//           lastName: req.user.lastName,
//           email: req.user.email,
//           dateOfBirth: req.user.dateOfBirth,
//           gender: req.user.gender,
//           joinedDate: req.user.joinedDate,
//           cart: req.user.cart
//         },

//         request: {
//           type: 'Get',
//           description: 'Get one product with the id',
//           url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/products/${createdAndReturnedProduct._id}`
//         }
//       }
//     });
//   } catch (error) {
//     // 500 Internal Server Error
//     res.status(500).send({
//       message: 'unable to save to database',
//       success: false,
//       status: 500,
//       error: error
//     });
//   }
// };

// // Handling individual Request to /product
// exports.products_get_one_product = (req, res, next) => {
//   const id = req.params.productId;

//   Product.findById(id)
//     .select('name price _id productImage addedDate')
//     .exec() // .exec() method return promise
//     .then(docs => {
//       if (docs) {
//         res.status(200).send({
//           message: 'Successfully Found product by given id',
//           success: true,
//           status: 200,
//           products: {
//             productImage: docs.productImage,
//             name: docs.name,
//             price: docs.price,
//             _id: docs._id,
//             addedDate: docs.addedDate,
//             request: {
//               type: 'Get',
//               description: 'Get all the products',
//               url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/products`
//             }
//           }
//         });
//       } else {
//         // if the id is not found in db it return null
//         res.status(404).send({
//           message: 'no valid entry found for provided ID',
//           success: false,
//           status: 400
//         });
//       }
//     })
//     .catch(error => {
//       // 500 Internal Server Error
//       res.status(500).send({
//         message: 'Internal Server Error(invalid id)',
//         success: false,
//         status: 500,
//         error: error
//       });
//     });
// };

// // Handling updating individual product
// exports.products_update_product = async (req, res, next) => {
//   const id = req.params.productId;

//   try {
//     const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true
//     });

//     if (!updateProduct) {
//       return res.status(400).send({
//         success: false,
//         message: `Database Update Failure `,
//         status: 400
//       });
//     }

//     return res.status(200).send({
//       message: 'Successfully Updated the product by given id',
//       success: true,
//       status: 200,
//       updateProduct: updateProduct,
//       _id: id,
//       request: {
//         type: 'Get',
//         description: 'Get one product with the id',
//         url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/products/${id}`
//       }
//     });
//   } catch (error) {
//     return res.status(500).send({
//       message: 'Internal Server Error(invalid id)',
//       success: false,
//       status: 500,
//       error: error
//     });
//   }
// };

// // Handling deleting individual product
// exports.products_delete_product = (req, res, next) => {
//   const id = req.params.productId;
//   // also we can use remove
//   Product.deleteOne({ _id: id })
//     .exec() // .exec() method return promise
//     .then(docs => {
//       if (docs) {
//         res.status(200).send({
//           message: 'Successfully deleted product by given id',
//           success: true,
//           status: 200,
//           request: {
//             type: 'Post',
//             description: 'You can post new Product',
//             url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/products`,
//             data: { name: 'string', price: 'Number' }
//           }
//         });
//       }
//     })
//     .catch(error => {
//       // 500 Internal Server Error
//       res.status(500).send({
//         message: 'Internal Server Error(invalid id)',
//         success: false,
//         status: 500,
//         error: error
//       });
//     });
// };
