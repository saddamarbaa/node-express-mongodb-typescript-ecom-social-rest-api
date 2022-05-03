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
