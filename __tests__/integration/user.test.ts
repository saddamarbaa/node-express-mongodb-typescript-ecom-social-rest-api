import request from 'supertest';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';

import app from '@src/app';
import { environmentConfig } from '@src/configs';
import User from '@src/models/User.model';
import Token from '@src/models/Token.model';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as sendEmailModule from '@src/utils/sendEmail';
import {
  adminEmails,
  authorizationRoles,
  cloudinaryResponse,
  correctFilePath as localFilePath,
  invaildFileType,
  userPayload,
  validMongooseObjectId,
} from '@src/constants';

jest.mock('cloudinary');

jest.mock('@src/utils/sendEmail', () => ({
  sendEmailVerificationEmail: jest.fn().mockResolvedValue('Sending Email Success'),
  sendResetPasswordEmail: jest.fn().mockResolvedValue('Sending Email Success'),
  sendConfirmResetPasswordEmail: jest.fn().mockResolvedValue('Sending Email Success'),
}));

beforeAll((done) => {
  jest.setTimeout(60000);
  mongoose.connect(environmentConfig.TEST_ENV_MONGODB_CONNECTION_STRING as string, () => {
    done();
  });
});

afterAll(async () => {
  mongoose.connection.db.dropDatabase(() => {});
  jest.clearAllMocks();

  // jest.mock('@src/utils/sendEmail', () => ({
  //   sendEmailVerificationEmail: jest.fn().mockReset(),
  //   sendResetPasswordEmail: jest.fn().mockReset(),
  //   sendConfirmResetPasswordEmail: jest.fn().mockReset(),
  // }));
});

beforeEach(async () => {
  jest.setTimeout(60000);
  await Token.deleteMany({});
  await User.deleteMany({});
  jest.clearAllMocks();
});

afterEach(async () => {
  await Token.deleteMany({});
  await User.deleteMany({});
});

describe('User', () => {
  /**
   * Testing auth registration endpoint
   */
  describe('POST /api/v1/auth/signup', () => {
    cloudinary.v2.uploader.upload = jest.fn().mockResolvedValue(cloudinaryResponse);

    describe('given any of the flowing filed is missing (name,surname,email,password,confirmPassword,profileImage)', () => {
      it('should return a 422 status with validation message', async () => {
        // Image is missing
        await request(app)
          .post('/api/v1/auth/signup')
          .field({ name: 'tets' })
          .set('Content-Type', 'multipart/form-data')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/Please upload Image/);
          });

        // name is missing
        await request(app)
          .post('/api/v1/auth/signup')
          .field({})
          .attach('profileImage', localFilePath)
          .set('Content-Type', 'multipart/form-data')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/name/);
          });

        // surname is missing
        await request(app)
          .post('/api/v1/auth/signup')
          .field({ name: 'test name' })
          .attach('profileImage', localFilePath)
          .set('Content-Type', 'multipart/form-data')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/surname/);
          });

        // email is missing
        await request(app)
          .post('/api/v1/auth/signup')
          .field({ name: 'test name', surname: 'surname' })
          .attach('profileImage', localFilePath)
          .set('Content-Type', 'multipart/form-data')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/email/);
          });

        // password is missing
        await request(app)
          .post('/api/v1/auth/signup')
          .field({ name: 'test name', surname: 'surname', email: 'email@gmail.com' })
          .attach('profileImage', localFilePath)
          .set('Content-Type', 'multipart/form-data')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/password/);
          });

        // confirmPassword is missing
        await request(app)
          .post('/api/v1/auth/signup')
          .field({ name: 'test name', surname: 'surname', email: 'email@gmail.com', password: 'password' })
          .attach('profileImage', localFilePath)
          .set('Content-Type', 'multipart/form-data')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/confirmPassword/);
          });
      });
    });

    describe('given invaild image type been attached in the profile filed', () => {
      it('should return a 422 status with validation message', async () => {
        await request(app)
          .post('/api/v1/auth/signup')
          .field({
            ...userPayload,
          })
          .set('Content-Type', 'multipart/form-data')
          .attach('profileImage', invaildFileType)
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              success: false,
              error: true,
              message: expect.any(String),
              status: 422,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });

    describe('given the password is less than 6 characters', () => {
      it('should return a 422 status with validation message', async () => {
        await request(app)
          .post('/api/v1/auth/signup')
          .field({
            ...userPayload,
            password: '123',
          })
          .set('Content-Type', 'multipart/form-data')
          .attach('profileImage', localFilePath)
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/length must be at least 6 characters long/);
          });
      });
    });

    describe('given the confirmPassword do not match', () => {
      it('should return a 422 status with validation message', async () => {
        await request(app)
          .post('/api/v1/auth/signup')
          .field({
            ...userPayload,
            password: 'password',
            confirmPassword: 'confirmPassword',
          })
          .set('Content-Type', 'multipart/form-data')
          .attach('profileImage', localFilePath)
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/confirmPassword/);
          });
      });
    });

    describe('given the email is not valid ', () => {
      it('should return a 422 status with validation message', async () => {
        await request(app)
          .post('/api/v1/auth/signup')
          .field({
            ...userPayload,
            email: 'notEmail',
          })
          .set('Content-Type', 'multipart/form-data')
          .attach('profileImage', localFilePath)
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/must be a valid email/);
          });
      });
    });

    describe('given the email address already been taken by other user', () => {
      it('should return a 409 status with validation message', async () => {
        await User.insertMany([
          {
            ...userPayload,
            profileImage: cloudinaryResponse.secure_url,
            cloudinary_id: cloudinaryResponse.public_id,
          },
        ]);

        await request(app)
          .post('/api/v1/auth/signup')
          .field({
            ...userPayload,
          })
          .set('Content-Type', 'multipart/form-data')
          .attach('profileImage', localFilePath)
          .expect('Content-Type', /json/)
          .expect(409)
          .then((response) => {
            expect(response.body).toMatchObject({
              success: false,
              error: true,
              message: expect.any(String),
              status: 409,
            });
            expect(response?.body?.message).toMatch(/already exists, please pick a different one/);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });

    describe('given all the user information are valid', () => {
      it('should create user, send email verification and return a 201 status', async () => {
        await request(app)
          .post('/api/v1/auth/signup')
          .field({
            ...userPayload,
          })
          .set('Content-Type', 'multipart/form-data')
          .attach('profileImage', localFilePath)
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: expect.any(String),
              status: 201,
            });

            expect(response.body.data).toMatchObject({
              user: {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
                verifyEmailLink: expect.any(String),
              },
            });

            expect(response?.body?.message).toMatch(
              /Auth Signup is success. An Email with Verification link has been sent/
            );

            // Check if the sendEmailVerificationEmail is really been called
            // @ts-ignore
            expect(sendEmailModule?.sendEmailVerificationEmail?.mock?.calls?.length).toBe(1);

            expect(sendEmailModule?.sendEmailVerificationEmail).toHaveBeenCalled();
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });
  });

  /**
   * Testing auth login endpoint
   */
  describe('POST /api/v1/auth/login', () => {
    describe('given the email or password is missing)', () => {
      it('should return a 422 status with validation message', async () => {
        // email is missing
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            password: userPayload.password,
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/email/);
          });

        // password is missing
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: userPayload.email,
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/password/);
          });
      });
    });

    describe('given the password is less than 6 characters', () => {
      it('should return a 422 status with validation message', async () => {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: userPayload.email,
            password: '123',
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              success: false,
              error: true,
              message: expect.any(String),
              status: 422,
            });
            expect(response?.body?.message).toMatch(/password/);
          });
      });
    });

    describe('given the email is invaild', () => {
      it('should return a 422 status with validation message', async () => {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'invaild email',
            password: '123hshdhsh',
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              success: false,
              error: true,
              message: expect.any(String),
              status: 422,
            });
            expect(response?.body?.message).toMatch(/must be a valid email/);
          });
      });
    });

    describe("given the email and password are valid schema but the user with the given email don't exists in DB", () => {
      it('should return a 422 status with validation message', async () => {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: userPayload.email,
            password: userPayload.password,
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              success: false,
              error: true,
              message: expect.any(String),
              status: 401,
            });
            expect(response?.body?.message).toMatch(/Auth Failed/);
          });
      });
    });

    describe('given the email and password are valid', () => {
      it('should authorized the user, set cookies and return a 200 status with access and refresh token', async () => {
        const newUser = new User({
          ...userPayload,
        });
        await newUser.save();
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: userPayload.email,
            password: userPayload.password,
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: expect.any(String),
              status: 200,
            });
          });
      });
    });
  });

  /**
   * Testing auth verify email endpoint
   */
  describe('GET /api/v1/auth/verify-email/:userId/:token', () => {
    describe('given the userId or token is invaild', () => {
      it('should return a 422 status with validation message', async () => {
        // token is invaild schema
        await request(app)
          .get(`/api/v1/auth/verify-email/${validMongooseObjectId}/to`)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/must be at least 3 characters long/);
          });

        // user id is invaild mongoose objectId
        await request(app)
          .get(`/api/v1/auth/verify-email/invaild/${validMongooseObjectId}`)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/fails to match the valid mongo id pattern/);
          });

        // user id is vaild mongoose objectId but no user with this id found in db
        await request(app)
          .get(`/api/v1/auth/verify-email/${validMongooseObjectId}/${validMongooseObjectId}`)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 400,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/Email verification token is invalid or has expired/);
          });
      });
    });

    describe('given the user email has already been verified', () => {
      it('should return a 200 status with message your email has already been verified. Please Login', async () => {
        const newUser = await User.create({
          ...userPayload,
        });

        await request(app)
          .get(`/api/v1/auth/verify-email/${newUser?._id}/${validMongooseObjectId}`)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              success: true,
              error: false,
              message: expect.any(String),
              status: 200,
            });
            expect(response?.body?.message).toMatch(/email has already been verified/);
          });
      });
    });

    describe('given the refresh token is expired', () => {
      it('should return a 400 status with message token is invalid or has expired', async () => {
        const newUser = await User.create({
          ...userPayload,
          isVerified: false,
        });

        await request(app)
          .get(`/api/v1/auth/verify-email/${newUser?._id}/${validMongooseObjectId}`)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 400,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/token is invalid or has expired/);
          });
      });
    });

    describe('given the userId and token are valid', () => {
      it('should verify the user, and return a 200 status with message your account has been successfully verified . Please Login ', async () => {
        try {
          await User.create({
            ...userPayload,
            isVerified: false,
          });

          const authResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
              email: userPayload.email,
              password: userPayload.password,
            })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/);

          if (authResponse && authResponse?.body?.data?.verifyEmailLink) {
            // verify Email Link Example
            // 'http://localhost:50050/verify-email?id=63ce41742b590e7c8115c02d&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2NlNDE3NDJiNTkwZTdjODExNWMwMmQiLCJpYXQiOjE2NzQ0NjE1NTgsImV4cCI6MTcwNjAxOTE1OCwiYXVkIjoiNjNjZTQxNzQyYjU5MGU3YzgxMTVjMDJkIiwiaXNzIjoidGVzdG5kb2Vqcy5jb20ifQ.QvQF2IBTzpJL9YTlSJILE7dxq3HLFrhzBzP6yJJ31kw';

            const fullLink = authResponse?.body?.data?.verifyEmailLink?.split('verify-email?')[1];
            const splitLink = fullLink?.split('&token=');
            const token = splitLink[1];
            const id = splitLink[0].split('id=')[1];

            await request(app)
              .get(`/api/v1/auth/verify-email/${id}/${token}`)
              .set('Accept', 'application/json')
              .set('Content-Type', 'application/json')
              .expect('Content-Type', /json/)
              .then((response) => {
                expect(response.body).toMatchObject({
                  data: null,
                  success: true,
                  error: false,
                  message: expect.any(String),
                  status: 200,
                });
                expect(response?.body?.message).toMatch(/account has been successfully verified/);
              });
          }
        } catch (error) {
          console.log('verify-email given the userId and token are valid filed ', error);
        }
      });
    });
  });
});
