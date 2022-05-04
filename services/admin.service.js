const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const User = require('../models/users.model');
const Product = require('../models/products.model');

const Response = require('../utils/response');
const { WEBSITE_URL, API_VERSION } = require('../configs/environment.config');

/**
 * @desc    Get all users
 * @route   GET /api/v1/admin/users
 * @access  Private
 */

exports.getUsers = (req, res) => {
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

  responseObject.users = results.map(user => {
    return {
      _id: user._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      dateOfBirth: user?.dateOfBirth,
      gender: user?.gender,
      cart: user?.cart,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
      role: user?.role,
      isVerified: user?.isVerified,
      status: user?.status,
      joinedDate: user?.joinedDate,
      profileImage: user?.profileImage,
      mobileNumber: user?.mobileNumber,
      companyName: user?.companyName,
      acceptTerms: user?.acceptTerms,
      nationality: user?.nationality,
      favoriteAnimal: user?.favoriteAnimal,
      address: user?.address,
      bio: user?.bio,
      jobTitle: user?.jobTitle,
      familyName: user?.familyName
    };
  });

  return Response(responseObject, true, false, 'Successful Found users', 200);
};

/**
 * @desc      Get user
 * @route    GET /api/v1/auth/userId or/api/v1/admin/users/userId
 * @access   Private
 */

exports.getUser = async (req, res, next) => {
  let responseObject = {};
  const userId = req.params.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg,
      responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      userId: userId
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return Response([], false, true, `Failed to delete user by given ID ${userId}`, 400);
    }

    const data = {
      user: {
        _id: user._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        dateOfBirth: user?.dateOfBirth,
        gender: user?.gender,
        cart: user?.cart,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
        role: user?.role,
        isVerified: user?.isVerified,
        status: user?.status,
        joinedDate: user?.joinedDate,
        profileImage: user?.profileImage,
        mobileNumber: user?.mobileNumber,
        companyName: user?.companyName,
        acceptTerms: user?.acceptTerms,
        nationality: user?.nationality,
        favoriteAnimal: user?.favoriteAnimal,
        address: user?.address,
        familyName: user?.familyName,
        bio: user?.bio,
        jobTitle: user?.jobTitle,
        request: {
          type: 'Get',
          description: 'Get all the user',
          url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/admin/users`
        }
      }
    };

    return Response(data, true, false, `Successfully find user by ID: ${userId}`, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     Update user
 * @route    PATCH /api/v1/auth/userId or/api/v1/admin/users/userId
 * @access   Private
 */

exports.updateUser = async (req, res, next) => {
  let responseObject = {};
  const {
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
    gender,
    cart,
    confirmPassword,
    familyName,
    mobileNumber,
    isDeleted,
    status,
    isVerified,
    role,
    bio,
    acceptTerms,
    companyName,
    nationality,
    address,
    favoriteAnimal
  } = req.body;

  const userId = req.params.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg,
      responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      userId: userId
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return Response([], false, true, `Database Update Failure`, 400);
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.password = password || user.password;
    user.confirmPassword = confirmPassword || user.confirmPassword;
    user.gender = gender || user.gender;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.familyName = familyName || user.familyName;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    user.isDeleted = isDeleted || user.isDeleted;
    user.status = status || user.status;
    user.cart = cart || user.cart;
    user.isVerified = isVerified || user.isVerified;
    user.role = role || user.role;
    user.acceptTerms = acceptTerms || user.acceptTerms;
    user.bio = bio || user.bio;
    user.familyName = familyName || user.familyName;
    user.acceptTerms = acceptTerms || user.acceptTerms;
    user.companyName = companyName || user.companyName;
    user.nationality = nationality || user.nationality;
    user.address = address || user.address;
    user.favoriteAnimal = favoriteAnimal || user.favoriteAnimal;

    const updatedUser = await user.save();
    const data = {
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        cart: updatedUser.cart,
        createdAt: updatedUser?.createdAt,
        updatedAt: updatedUser?.updatedAt,
        role: updatedUser?.role,
        status: updatedUser.status,
        mobileNumber: updatedUser?.mobileNumber,
        familyName: updatedUser?.familyName,
        profileImage: updatedUser?.profileImage,
        isVerified: updatedUser?.isVerified,
        acceptTerms: updatedUser?.acceptTerms,
        bio: updatedUser.bio,
        acceptTerms: updatedUser.acceptTerms,
        companyName: updatedUser.companyName,
        nationality: updatedUser.nationality,
        address: updatedUser.address,
        favoriteAnimal: updatedUser.favoriteAnimal
      },

      request: {
        type: 'Get',
        description: 'Get all the user',
        url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/admin/users`
      }
    };

    return Response(data, true, false, `Successfully updated user by ID: ${userId}`, 201);
  } catch (error) {
    if (error?.code === 11000) {
      // also we can send  422(422 Unprocessable Entity)
      // 409 Conflict
      return Response({}, false, true, `E-Mail address  ${email} is already exists, please pick a different one.`, 409);
    }

    // 500 Internal Server Error
    return next(error);
  }
};

/**
 * @desc     Delete user
 * @route    DELETE /api/v1/admin/users/userId
 * @access   Private
 */

exports.deleteUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    const responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      userId: req.params.userId
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const toBeDeletedUser = await User.findByIdAndRemove({
      _id: req.params.userId
    });

    if (!toBeDeletedUser) {
      return Response([], false, true, `Failed to delete user by given ID ${req.params.userId}`, 400);
    }

    return Response([], true, false, `Successfully deleted user by ID ${req.params.userId}`, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     add new product
 * @route    POST /api/v1/admin/products
 * @access   Private
 */

exports.addProduct = async (req, res, next) => {
  const { name, price, description, count, rating, stock, category } = req.body;
  const { userId } = req.user;

  const givenProduct = new Product({
    _id: new mongoose.Types.ObjectId(),
    name,
    price,
    description,
    count,
    rating,
    userId,
    stock,
    category,
    productImage: `/static/uploads/${req.file.filename}`
  });

  try {
    const createdAndReturnedProduct = await Product.create(givenProduct);
    const data = {
      product: {
        name: createdAndReturnedProduct.name,
        price: createdAndReturnedProduct.price,
        productImage: createdAndReturnedProduct.productImage,
        _id: createdAndReturnedProduct._id,
        addedDate: createdAndReturnedProduct.addedDate,
        user: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          dateOfBirth: req.user.dateOfBirth,
          gender: req.user.gender,
          joinedDate: req.user.joinedDate,
          cart: req.user.cart,
          createdAt: req.user?.createdAt,
          updatedAt: req.user?.updatedAt,
          role: req.user?.role
        },
        request: {
          type: 'Get',
          description: 'Get  all products',
          url: `${WEBSITE_URL}/api/${API_VERSION}/products`
        }
      }
    };

    //  HTTP Status 201 indicates that as a result of HTTP POST  request,
    //  One or more new resources have been successfully created on server
    return Response(data, true, false, `Successfully Created new Product`, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     Delete product
 * @route    DELETE /api/v1/admin/products/productId
 * @access   Private
 */

exports.deleteProduct = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    const responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      productId: req.params.productId
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const toBeDeletedProduct = await Product.findByIdAndRemove({
      _id: req.params.productId
    });

    if (!toBeDeletedProduct) {
      return Response([], false, true, `Failed to delete product by given ID ${req.params.productId}`, 400);
    }

    return Response([], true, false, `Successfully deleted product by ID ${req.params.productId}`, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc      Get product
 * @route     Get /api/v1/admin/products/productId
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
    const doc = awaitProduct.findById(req.params.productId);
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
