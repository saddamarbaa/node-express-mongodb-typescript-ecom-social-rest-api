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
});
