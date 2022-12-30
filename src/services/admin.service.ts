import { NextFunction, Request, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';
import { SignOptions } from 'jsonwebtoken';

import Token from '@src/models/Token.model';
import User from '@src/models/User.model';
import Order from '@src/models/Order.model';

import { environmentConfig } from '@src/configs/custom-environment-variables.config';

import {
  AuthenticatedRequestBody,
  IUser,
  ProcessingOrderT,
  ProductT,
  ResponseT,
  TPaginationResponse,
} from '@src/interfaces';
import { customResponse, deleteFile, isValidMongooseObjectId, sendEmailVerificationEmail } from '@src/utils';
import Product from '@src/models/Product.model';
import { authorizationRoles } from '@src/constants';

export const adminAddUserService = async (req: Request, res: Response<ResponseT<null>>, next: NextFunction) => {
  const {
    email,
    password,
    name,
    surname,
    confirmPassword,
    jobTitle,
    bio,
    favoriteAnimal,
    mobileNumber,
    gender,
    dateOfBirth,
    address,
    nationality,
    companyName,
    role,
  } = req.body;

  const newUser = new User({
    email,
    password,
    name,
    surname,
    confirmPassword,
    jobTitle,
    bio,
    favoriteAnimal,
    mobileNumber,
    gender,
    dateOfBirth,
    role,
    address,
    nationality,
    companyName,
    profileImage: req.file?.filename ? `/static/uploads/users/${req.file.filename}` : '/static/uploads/users/temp.png',
    acceptTerms: true,
  });

  try {
    const isEmailExit = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (isEmailExit) {
      return next(createHttpError(422, `E-Mail address ${email} is already exists, please pick a different one.`));
    }

    const user = await newUser.save();
    let token = await new Token({ userId: user._id });

    const payload = {
      userId: user._id,
    };

    const accessTokenSecretKey = environmentConfig.ACCESS_TOKEN_SECRET_KEY as string;
    const accessTokenOptions: SignOptions = {
      expiresIn: environmentConfig.ACCESS_TOKEN_KEY_EXPIRE_TIME,
      issuer: environmentConfig.JWT_ISSUER,
      audience: String(user._id),
    };

    const refreshTokenSecretKey = environmentConfig.REFRESH_TOKEN_SECRET_KEY as string;
    const refreshTokenJwtOptions: SignOptions = {
      expiresIn: environmentConfig.REFRESH_TOKEN_KEY_EXPIRE_TIME,
      issuer: environmentConfig.JWT_ISSUER,
      audience: String(user._id),
    };

    // Generate and set verify email token
    const generatedAccessToken = await token.generateToken(payload, accessTokenSecretKey, accessTokenOptions);
    const generatedRefreshToken = await token.generateToken(payload, refreshTokenSecretKey, refreshTokenJwtOptions);

    // Save the updated token
    token.refreshToken = generatedRefreshToken;
    token.accessToken = generatedAccessToken;
    token = await token.save();

    const verifyEmailLink = `${environmentConfig.WEBSITE_URL}/verify-email?id=${user._id}&token=${token.refreshToken}`;

    // send mail for email verification
    sendEmailVerificationEmail(email, name, verifyEmailLink);

    const data = {
      user: {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        verifyEmailLink,
      },
    };

    return res.status(201).json(
      customResponse<any>({
        data,
        success: true,
        error: false,
        message: `Auth Signup is success. An Email with Verification link has been sent to your account ${user.email} Please Verify Your Email first or use the email verification lik which is been send with the response body to verfiy your email`,
        status: 201,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminUpdateAuthService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  if (!isValidMongooseObjectId(req.params.userId) || !req.params.userId) {
    return next(createHttpError(422, `Invalid request`));
  }

  const rolesArray = Object.values(authorizationRoles);
  // check for valid role
  if (req.body.role && !rolesArray.includes(req.body.role)) {
    if (!rolesArray.includes(req.body.role)) {
      return next(createHttpError(422, `Invalid role`));
    }
  }

  const {
    name,
    surname,
    email,
    dateOfBirth,
    gender,
    mobileNumber,
    bio,
    companyName,
    nationality,
    address,
    favoriteAnimal,
    jobTitle,
    acceptTerms,
    // role,
  } = req.body;

  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return next(new createHttpError.BadRequest());
    }

    // Admin cant update them roles
    if (req.body.role && req.user?._id.equals(user._id) && req.body.role !== authorizationRoles.admin) {
      return next(
        createHttpError(403, `Auth Failed (Admin cant remove themselves from admin , please ask another admin)`)
      );
    }

    if (email) {
      const existingUser = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
      if (existingUser && !existingUser._id.equals(user._id)) {
        return next(createHttpError(422, `E-Mail address ${email} is already exists, please pick a different one.`));
      }
    }

    user.name = name || user.name;
    user.surname = surname || user.surname;
    user.email = email || user.email;
    user.gender = gender || user.gender;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    user.acceptTerms = acceptTerms || user.acceptTerms;
    user.bio = bio || user.bio;
    user.companyName = companyName || user.companyName;
    user.nationality = nationality || user.nationality;
    user.address = address || user.address;
    user.jobTitle = jobTitle || user.jobTitle;
    user.favoriteAnimal = favoriteAnimal || user.favoriteAnimal;
    user.role = req.body.role || user.role;
    user.status = req.body.status || user.status;
    user.profileImage = req.file?.filename ? `/static/uploads/users/${req.file.filename}` : user.profileImage;

    const updatedUser = await user.save({ validateBeforeSave: false, new: true });

    if (!updatedUser) {
      return next(createHttpError(422, `Failed to update user by given ID ${req.params.userId}`));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      password: pass,
      confirmPassword,
      isVerified,
      isDeleted,
      status,
      acceptTerms: acceptTerm,
      role: roles,
      ...otherUserInfo
    } = updatedUser._doc;

    return res.status(200).send(
      customResponse<{ user: IUser }>({
        success: true,
        error: false,
        message: `Successfully updated user by ID: ${req.params.userId}`,
        status: 200,
        data: { user: otherUserInfo },
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};
export const adminGetUsersService = async (_req: Request, res: TPaginationResponse) => {
  if (res?.paginatedResults) {
    const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;
    const responseObject: any = {
      totalDocs: totalDocs || 0,
      totalPages: totalPages || 0,
      lastPage: lastPage || 0,
      count: results?.length || 0,
      currentPage: currentPage || 0,
    };

    if (next) {
      responseObject.nextPage = next;
    }
    if (previous) {
      responseObject.prevPage = previous;
    }

    responseObject.users = results?.map((userDoc: any) => {
      return {
        ...userDoc._doc,
        request: {
          type: 'Get',
          description: 'Get user info',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/admin/users/${userDoc._doc._id}`,
        },
      };
    });

    return res.status(200).send(
      customResponse<typeof responseObject>({
        success: true,
        error: false,
        message: 'Successful Found users',
        status: 200,
        data: responseObject,
      })
    );
  }
};

export const adminGetUserService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  if (!isValidMongooseObjectId(req.params.userId) || !req.params.userId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return next(new createHttpError.BadRequest());
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, confirmPassword, ...otherUserInfo } = user._doc;

    const data = {
      user: {
        ...otherUserInfo,
        request: {
          type: 'Get',
          description: 'Get all the user',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/admin/users`,
        },
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found user by ID: ${req.params.userId} profile 🍀`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const adminAddProductService = async (
  req: AuthenticatedRequestBody<ProductT>,
  res: Response,
  next: NextFunction
) => {
  const { name, price, description, brand, category, stock } = req.body;

  if (!req.file) {
    return next(createHttpError(422, `Invalid request (Please upload Image)`));
  }

  const userId = req?.user?._id || '';

  const productData = new Product({
    name,
    price,
    description,
    brand,
    category,
    stock,
    productImage: `/static/uploads/products/${req?.file?.filename}`,
    user: userId,
  });

  try {
    const createdProduct = await Product.create(productData);

    const data = {
      product: {
        _id: createdProduct._id,
        name: createdProduct.name,
        price: createdProduct.price,
        description: createdProduct.description,
        productImage: createdProduct.productImage,
        count: createdProduct.count,
        ratings: createdProduct.ratings,
        brand: createdProduct.brand,
        stock: createdProduct.stock,
        category: createdProduct.category,
        reviews: createdProduct.reviews,
        numberOfReviews: createdProduct.numberOfReviews,
        user: {
          name: req.user?.name,
          surname: req.user?.surname,
          email: req.user?.email,
          dateOfBirth: req.user?.dateOfBirth,
          gender: req.user?.gender,
          createdAt: req.user?.createdAt,
          updatedAt: req.user?.updatedAt,
          role: req.user?.role,
        },
        request: {
          type: 'Get',
          description: 'Get  all products',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/products`,
        },
      },
    };

    return res.status(201).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: 'Successfully created new product',
        status: 201,
        data,
      })
    );
  } catch (error: any) {
    return next(error);
  }
};

export const adminGetProductsService = async (_req: Request, res: TPaginationResponse) => {
  if (res?.paginatedResults) {
    const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;
    const responseObject: any = {
      totalDocs: totalDocs || 0,
      totalPages: totalPages || 0,
      lastPage: lastPage || 0,
      count: results?.length || 0,
      currentPage: currentPage || 0,
    };

    if (next) {
      responseObject.nextPage = next;
    }
    if (previous) {
      responseObject.prevPage = previous;
    }

    responseObject.products = results?.map((productDoc: any) => {
      const { productImage } = productDoc._doc;
      return {
        ...productDoc._doc,
        productImage: `${process.env.API_URL}${productImage}`,
        request: {
          type: 'Get',
          description: 'Get one product with the id',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/products/${productDoc._doc._id}`,
        },
      };
    });

    return res.status(200).send(
      customResponse<typeof responseObject>({
        success: true,
        error: false,
        message: 'Successful Found products',
        status: 200,
        data: responseObject,
      })
    );
  }
};

export const adminGetProductService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  if (!isValidMongooseObjectId(req.params.productId) || !req.params.productId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return next(new createHttpError.BadRequest());
    }

    const data = {
      product: {
        ...product._doc,
        request: {
          type: 'Get',
          description: 'Get all the product',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/admin/products`,
        },
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found product by ID: ${req.params.productId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const adminUpdateProductService = async (
  req: AuthenticatedRequestBody<ProductT>,
  res: Response,
  next: NextFunction
) => {
  if (!isValidMongooseObjectId(req.params.productId) || !req.params.productId) {
    return next(createHttpError(422, `Invalid request`));
  }

  const { name, price, description, brand, category, stock } = req.body;

  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return next(new createHttpError.BadRequest());
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    if (req?.file?.filename) {
      product.profileImage = `/static/uploads/products/${req?.file?.filename}`;
      // Delete the old product image
      const imagePath = product?._doc?.productImage.split('/').pop() || '';
      const folderFullPath = `${process.env.PWD}/public/uploads/products/${imagePath}`;
      deleteFile(folderFullPath);
    }

    const updatedProduct = await product.save();

    const data = {
      product: {
        ...updatedProduct._doc,
        user: {
          name: req.user?.name,
          surname: req.user?.surname,
          email: req.user?.email,
          dateOfBirth: req.user?.dateOfBirth,
          gender: req.user?.gender,
          createdAt: req.user?.createdAt,
          updatedAt: req.user?.updatedAt,
          role: req.user?.role,
        },
        request: {
          type: 'Get',
          description: 'Get  all products',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/products`,
        },
      },
    };

    return res.status(200).json(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully update product by ID ${req.params.productId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const adminDeleteProductService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  if (!isValidMongooseObjectId(req.params.productId) || !req.params.productId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const product = await Product.findByIdAndRemove({
      _id: req.params.productId,
    });

    if (!product) {
      return next(createHttpError(400, `Failed to delete product by given ID ${req.params.productId}`));
    }

    // Delete the product image
    const fullImage = product.productImage || '';
    const imagePath = fullImage.split('/').pop() || '';
    const folderFullPath = `${process.env.PWD}/public/uploads/products/${imagePath}`;

    deleteFile(folderFullPath);

    return res.status(200).json(
      customResponse({
        data: null,
        success: true,
        error: false,
        message: `Successfully deleted product by ID ${req.params.productId}`,
        status: 200,
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // fs.stat(folderFullPath, function (err, stats) {
    //   console.log(stats); // here we got all information of file in stats variable

    //   if (err) {
    //     // console.error(err);
    //     return res.status(200).json(
    //       customResponse({
    //         data: null,
    //         success: true,
    //         error: false,
    //         message: `Successfully deleted product by ID ${req.params.productId} but fail to delete the image`,
    //         status: 200,
    //       })
    //     );
    //   }

    //   fs.unlink(folderFullPath, function (error) {
    //     if (error) return console.log(error);
    //     console.log('file deleted successfully');

    //   });
    // });
  } catch (error) {
    return next(InternalServerError);
  }
};

export const adminUpdateOrderStatusService = async (
  req: AuthenticatedRequestBody<ProcessingOrderT>,
  res: Response,
  next: NextFunction
) => {
  const { orderStatus } = req.body;
  if (!isValidMongooseObjectId(req.params.orderId) || !req.params.orderId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const { orderId } = req.params;
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        orderStatus,
      },
      {
        new: true,
      }
    )
      .populate('user.userId', '-password -confirmPassword ')
      .populate({
        path: 'orderItems.product',
        populate: { path: 'user', select: '-password -confirmPassword' },
      })
      .exec();

    if (!order) {
      return next(new createHttpError.BadRequest());
    }
    const data = {
      order,
    };

    return res.status(201).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully update order by ID ${orderId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminGetOrdersService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find()
      .populate('user.userId', '-password -confirmPassword ')
      .populate({
        path: 'orderItems.product',
        // Get users of product
        populate: { path: 'user', select: '-password -confirmPassword' },
      })
      .exec();

    const data = {
      orders,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successful Found all orders`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminGetOrderService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  if (!isValidMongooseObjectId(req.params.orderId) || !req.params.orderId) {
    return next(createHttpError(422, `Invalid request`));
  }
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('user.userId', '-password -confirmPassword ')
      .populate({
        path: 'orderItems.product',
        // Get users of product
        populate: { path: 'user', select: '-password -confirmPassword' },
      })
      .exec();

    if (!order) {
      return next(new createHttpError.BadRequest());
    }

    const data = {
      order,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found order by ID ${orderId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminGetAllOrdersForGivenUserService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  if (!isValidMongooseObjectId(req.params.userId) || !req.params.userId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const { userId } = req.params;

    const orders = await Order.find({ 'user.userId': userId })
      .populate('user.userId', '-password -confirmPassword ')
      .populate({
        path: 'orderItems.product',
        populate: { path: 'user', select: '-password -confirmPassword' },
      })
      .exec();

    const data = {
      orders,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: !orders.length
          ? `No order found for user by ID ${userId}`
          : `Successfully found  all order for user by ID ${userId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminDeleteSingleOrderService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  if (!isValidMongooseObjectId(req.params.orderId) || !req.params.orderId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new createHttpError.BadRequest());
    }

    const isRemoved = await Order.findByIdAndRemove({
      _id: orderId,
    });

    if (!isRemoved) {
      return next(createHttpError(400, `Failed to delete order by given ID ${orderId}`));
    }

    return res.status(200).json(
      customResponse({
        data: null,
        success: true,
        error: false,
        message: `Successfully deleted order by ID ${orderId}`,
        status: 200,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminDeleteAllOrderForGivenUserService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  if (!isValidMongooseObjectId(req.params.userId) || !req.params.userId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const { userId } = req.params;
    const droppedUserOrder = await Order.deleteMany({ 'user.userId': userId });

    if (droppedUserOrder.deletedCount === 0) {
      return next(createHttpError(400, `Failed to delete order for given user by ID ${userId}`));
    }

    return res.status(200).json(
      customResponse({
        data: null,
        success: true,
        error: false,
        message: `Successfully deleted all orders for user by ID ${userId}`,
        status: 200,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminClearAllOrdersService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Delete complete Order collection
    const dropCompleteCollection = await Order.deleteMany({});

    if (dropCompleteCollection.deletedCount === 0) {
      return next(createHttpError(400, `Failed to Cleared orders`));
    }

    return res.status(200).send(
      customResponse({
        success: true,
        error: false,
        message: `Successful Cleared all orders`,
        status: 200,
        data: null,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export default adminGetUsersService;
