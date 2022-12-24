import { NextFunction, Request, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';
import { SignOptions } from 'jsonwebtoken';

import Token from '@src/models/Token.model';
import User from '@src/models/User.model';

import { environmentConfig } from '@src/configs/custom-environment-variables.config';

import { AuthenticatedRequestBody, IUser, ProductT, ResponseT, TPaginationResponse } from '@src/interfaces';
import { customResponse, deleteFile, isValidMongooseObjectId, sendEmailVerificationEmail } from '@src/utils';
import Product from '@src/models/Product.model';

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

export default adminGetUsersService;