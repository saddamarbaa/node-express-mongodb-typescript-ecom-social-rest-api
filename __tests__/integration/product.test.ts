import request from 'supertest';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';

import app from '@src/app';
import { environmentConfig } from '@src/configs';
import Product from '@src/models/Product.model';
import User from '@src/models/User.model';
import Token from '@src/models/Token.model';
import {
  adminEmails,
  authorizationRoles,
  cloudinaryResponse,
  correctFilePath as localFilePath,
  productPayload,
  userPayload,
} from '@src/constants';

beforeAll((done) => {
  jest.setTimeout(90 * 1000);
  mongoose.connect(environmentConfig.TEST_ENV_MONGODB_CONNECTION_STRING as string, () => {
    done();
  });
});

afterAll(async () => {
  // await Token.deleteMany({});
  // await User.deleteMany({});
  mongoose.connection.db.dropDatabase(() => {});
  await mongoose.disconnect();
  await mongoose.connection.close();
  jest.clearAllMocks();
  jest.setTimeout(5 * 1000);
});

beforeEach(async () => {
  await Token.deleteMany({});
  await User.deleteMany({});
  await Product.deleteMany({});
});

afterEach(async () => {
  await Token.deleteMany({});
  await User.deleteMany({});
  await Product.deleteMany({});
});

describe('product', () => {
  /**
   * Testing get single product endpoint
   */
  describe('GET /api/v1/products/:productId', () => {
    describe('given the product does not exist', () => {
      it('should return a 400 status', async () =>
        request(app)
          .get(`/api/v1/products/63a449d6f4cf592dedf5c60b`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              success: false,
              error: true,
              message: 'Bad Request',
              status: 400,
              stack: expect.any(String),
            });
          }));
    });

    describe('given invaild product id', () => {
      it('should return a 422 status', async () => {
        const productId = 'product-123';
        return request(app)
          .get(`/api/v1/products/${productId}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(422)
          .then((response) =>
            expect(response.body).toMatchObject({
              data: null,
              success: false,
              error: true,
              message: expect.any(String),
              status: 422,
            })
          );
      });
    });

    describe('given the product does exist', () => {
      it('should return a 200 status and the product', async () => {
        // create user
        const newUser = new User({
          ...userPayload,
        });

        await newUser.save();

        // Login to get token and user id
        const logUser = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: userPayload.email, password: userPayload.password });

        // create product
        const newProduct = new Product({ ...productPayload, user: logUser?.body?.data?.user?._id });
        const response = await newProduct.save();

        //  pass the created  product it to this test
        const productId = response?._id;

        const finalResult = await request(app)
          .get(`/api/v1/products/${productId}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(finalResult?.body?.data?.product).toMatchObject(productPayload);
      });
    });
  });

  /**
   * Testing get all products endpoint
   */
  describe('GET /api/v1/products', () => {
    describe('given no product in db', () => {
      it('should return empty array with a 200', async () => {
        request(app)
          .get('/api/v1/products')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            return expect(response.body.data).toMatchObject({
              totalDocs: 0,
              totalPages: 0,
              lastPage: 0,
              count: 0,
              currentPage: { page: 1, limit: 20 },
              products: [],
            });
          });
      });
    });

    describe('given added 2 product in db', () => {
      it('should return array of 2 product with a 200', async () => {
        cloudinary.v2.uploader.upload = jest.fn().mockResolvedValue(cloudinaryResponse);

        // create user
        const newUser = new User({
          ...userPayload,
        });

        await newUser.save();

        const newProduct = { ...productPayload, user: newUser?._id };
        await Product.insertMany([
          {
            ...newProduct,
          },
          {
            ...newProduct,
          },
        ]);

        request(app)
          .get('/api/v1/products')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.data).toMatchObject({
              totalDocs: 2,
            });
            expect(response?.body?.data?.products?.length).toBe(2);
            expect(response?.body?.data?.products[0].name).toMatch(productPayload.name);
          });
      });
    });
  });

  /**
   * Testing post product endpoint
   */
  describe('POST /api/v1/admin/products/add', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .post('/api/v1/admin/products/add')
          .attach('productImages', localFilePath)
          .expect(401)
          .then((response) =>
            expect(response.body).toMatchObject({
              data: null,
              success: false,
              error: true,
              message: expect.any(String),
              status: 401,
              stack: expect.any(String),
            })
          )
          .catch((error) => {
            console.log(error);
          });
      });
    });

    describe('given the user is logged in and the logged user is not admin', () => {
      it('should return a 403 status with a json message - unauthorized', async () => {
        // create user
        const newUser = new User({
          ...userPayload,
        });
        await newUser.save();

        // Login to get token and user id
        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: userPayload.email, password: userPayload.password });
        const TOKEN = authResponse?.body?.data?.accessToken || '';

        request(app)
          .post('/api/v1/admin/products/add')
          .set('Authorization', `Bearer ${TOKEN}`)
          .attach('productImages', localFilePath)
          .expect(403)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              success: false,
              error: true,
              message: expect.any(String),
              status: 403,
              stack: expect.any(String),
            });
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });

    describe('given the user is logged in and authorized', () => {
      describe('given invaild product', () => {
        it('should validated product schema and return a 422 status with validation message', async () => {
          // create user
          const newUser = new User({
            ...userPayload,
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            role: authorizationRoles.admin,
          });
          await newUser.save();

          // Login to get token and user id
          const authResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
              email: (adminEmails && adminEmails[0]) || userPayload.email,
              password: userPayload.password,
            });
          const token = authResponse?.body?.data?.accessToken || '';

          if (token) {
            request(app)
              .post('/api/v1/admin/products/add')
              .set('Authorization', `Bearer ${token}`)
              .attach('productImages', localFilePath)
              .expect('Content-Type', /json/)
              .expect(422)
              .then((response) => {
                expect(response.body).toMatchObject({
                  data: null,
                  success: false,
                  error: true,
                  message: expect.any(String),
                  status: 422,
                  stack: expect.any(String),
                });
              })
              .catch((error) => {
                console.log(error);
              });
          }
        });
      });

      describe('given invaild product with no images been attached', () => {
        it('should validated file upload and return a 422 status with validation message', async () => {
          // create user
          const newUser = new User({
            ...userPayload,
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            role: authorizationRoles.admin,
          });
          await newUser.save();

          // Login to get token and user id
          const authResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
              email: (adminEmails && adminEmails[0]) || userPayload.email,
              password: userPayload.password,
            });
          const token = authResponse?.body?.data?.accessToken || '';

          if (token) {
            request(app)
              .post('/api/v1/admin/products/add')
              .set('Authorization', `Bearer ${token}`)
              // .attach('productImages', localFilePath)
              .expect('Content-Type', /json/)
              .expect(422)
              .then((response) => {
                expect(response.body).toMatchObject({
                  data: null,
                  success: false,
                  error: true,
                  message: expect.any(String),
                  status: 422,
                  stack: expect.any(String),
                });
              })
              .catch((error) => {
                console.log(error);
              });
          }
        });
      });

      describe('given vaild product ', () => {
        it('should return a 201 status and create the product', async () => {
          // create user
          const newUser = new User({
            ...userPayload,
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            role: authorizationRoles.admin,
          });
          await newUser.save();

          // Login to get token and user id
          const authResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
              email: (adminEmails && adminEmails[0]) || userPayload.email,
              password: userPayload.password,
            });
          const token = authResponse?.body?.data?.accessToken || '';

          if (token) {
            request(app)
              .post('/api/v1/admin/products/add')
              .field({
                name: productPayload.name,
                price: productPayload.price,
                brand: productPayload.price,
                description: productPayload.description,
              })
              .set('Authorization', `Bearer ${token}`)
              .set('Content-Type', 'multipart/form-data')
              .attach('productImages', localFilePath)
              .expect('Content-Type', /json/)
              .expect(201)
              .then((response) => {
                expect(response.body).toMatchObject({
                  success: true,
                  error: false,
                  message: expect.any(String),
                  status: 201,
                });

                expect(response.body?.data?.product).toMatchObject({
                  name: productPayload.name,
                  price: productPayload.price,
                  description: productPayload.description,
                });
              })
              .catch((error) => {
                console.log(error);
              });
          }
        });
      });
    });
  });
});
