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
  jest.setTimeout(90 * 1000);
  mongoose.connect(environmentConfig.TEST_ENV_MONGODB_CONNECTION_STRING as string, {}, (err) => {
    if (err) return console.log('Failed to connect to DB', err);
    done();
  });
});

afterAll(async () => {
  mongoose?.connection?.db?.dropDatabase(() => {});
  jest.clearAllMocks();
  jest.setTimeout(5 * 1000);

  // jest.mock('@src/utils/sendEmail', () => ({
  //   sendEmailVerificationEmail: jest.fn().mockReset(),
  //   sendResetPasswordEmail: jest.fn().mockReset(),
  //   sendConfirmResetPasswordEmail: jest.fn().mockReset(),
  // }));
});

beforeEach(async () => {
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

  /**
   * Testing auth logout endpoint
   */
  describe('POST /api/v1/auth/logout', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .post('/api/v1/auth/logout')
          .send({
            refreshToken: 'token',
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .then((response) =>
            expect(response.body).toMatchObject({
              data: null,
              success: false,
              error: true,
              message: 'Bad Request',
              status: 400,
              stack: expect.any(String),
            })
          )
          .catch((error) => {
            console.log(error);
          });
      });
    });

    describe('given the user is logged in and the refresh token is valid', () => {
      it('should logged out the user, and return a 200 status with a json message - logged out success', async () => {
        // create user
        const newUser = new User({
          ...userPayload,
        });

        await newUser.save();

        // Login to get token and user id
        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: userPayload.email, password: userPayload.password });
        const refreshToken = authResponse?.body?.data?.refreshToken || '';

        await request(app)
          .post('/api/v1/auth/logout')
          .send({
            refreshToken,
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: expect.any(String),
              status: 200,
            });

            expect(response?.body?.message).toMatch(/logged out/);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });

    describe('given the refresh token is invaild', () => {
      it('should return a 422 status with validation message', async () => {
        request(app)
          .post('/api/v1/auth/logout')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
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
            expect(response?.body?.message).toMatch(/is required/);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });
  });

  /**
   * Testing get user profile endpoint
   */
  describe('GET /api/v1/auth/me', () => {
    describe('given the user is logged in', () => {
      it('should return a 200 status with a json containing user profile', async () => {
        const newUser = new User({
          ...userPayload,
        });
        await newUser.save();

        // Login to get token and cookies
        const authResponse = await request(app).post('/api/v1/auth/login').send({
          email: userPayload.email,
          password: userPayload.password,
        });

        const cookies = authResponse && authResponse?.headers['set-cookie'];
        const TOKEN = authResponse?.body?.data?.accessToken || '';

        await request(app)
          .get('/api/v1/auth/me')
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${TOKEN}`)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: expect.any(String),
              status: 200,
            });

            expect(response?.body?.data?.user?.name).toMatch(userPayload.name);
            expect(response?.body?.data?.user?.surname).toMatch(userPayload.surname);
            expect(response?.body?.data?.user?.email).toMatch(userPayload.email);
            expect(response?.body?.message).toMatch(/user profile/);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });

    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .get('/api/v1/auth/me')
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
  });

  /**
   * Testing delete auth endpoint
   */
  describe('DELETE /api/v1/auth/remove/:userId', () => {
    cloudinary.v2.uploader.destroy = jest.fn().mockResolvedValue({ success: true });
    describe('given the user is logged in and authorized and the given userId to removed does exist in DB', () => {
      it('should return a 200 status with a json message - success', async () => {
        const newUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });
        await newUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        const userId = (authResponse && authResponse?.body?.data?.user?._id) || '';

        if (userId && token) {
          await request(await app)
            .delete(`/api/v1/auth/remove/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .then((response) => {
              return expect(response.body).toMatchObject({
                data: null,
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });
            });
        }
      });
    });

    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .delete('/api/v1/auth/remove/userId')
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
          );
      });
    });

    describe('given the user is logged in but the given userId to removed does not exist in DB', () => {
      it('should return a 401 status with a json message - Bad Request', async () => {
        const newUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });
        await newUser.save();

        const authResponse = await request(await app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        // const cookies = authResponse && authResponse?.headers['set-cookie'];
        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .delete(`/api/v1/auth/remove/${validMongooseObjectId}`)
            // .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then((response) =>
              expect(response.body).toMatchObject({
                data: null,
                success: false,
                error: true,
                message: expect.any(String),
                status: 400,
              })
            );
        }
      });
    });

    describe('given the user is logged in and the given userId to removed does exist in DB but the user is Unauthorized to remove', () => {
      it('should return a 403 status with a json message - Unauthorized', async () => {
        await User.insertMany([
          {
            ...userPayload,
            _id: validMongooseObjectId,
          },
          {
            ...userPayload,
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            role: authorizationRoles.admin,
          },
        ]);

        const newUser = new User({
          ...userPayload,
          email: 'test8@gmail.com',
        });
        await newUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test8@gmail.com',
            password: userPayload.password,
          })
          .expect(200);

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .delete(`/api/v1/auth/remove/${validMongooseObjectId}`)
            .set('Authorization', `Bearer ${token}`)
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
        }
      });
    });
  });

  /**
   * Testing update auth endpoint
   */
  describe('PATCH  /api/v1/auth/update/:userId', () => {
    cloudinary.v2.uploader.destroy = jest.fn().mockResolvedValue({ success: true });

    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .patch('/api/v1/auth/update/userId')
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
          );
      });
    });

    describe('given invaild user id', () => {
      it('should return a 400 status with a json message - bad request', async () => {
        const newUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });
        await newUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .patch(`/api/v1/auth/update/${validMongooseObjectId}`)
            .set('Authorization', `Bearer ${token}`)
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                success: false,
                error: true,
                message: expect.any(String),
                status: 400,
                stack: expect.any(String),
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given the user is logged in and authorized and the given userId to updated does exist in DB', () => {
      it('should return a 200 status with the updated user', async () => {
        const newUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });
        await newUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        const userId = (authResponse && authResponse?.body?.data?.user?._id) || '';
        const newName = 'testNew';
        if (userId && token) {
          await request(app)
            .patch(`/api/v1/auth/update/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .field({
              name: newName,
            })
            .set('Content-Type', 'multipart/form-data')
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });
              expect(response?.body.data?.user?.name).toMatch(newName.toLowerCase());
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  });

  /**
   * Testing auth refresh token endpoint
   */
  describe('POST /api/v1/auth/refresh-token', () => {
    describe('given the refresh token is invaild or missing', () => {
      it('should return a 422 status with validation message', async () => {
        // token is missing
        await request(app)
          .post(`/api/v1/auth/refresh-token`)
          .send({})
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
            expect(response?.body?.message).toMatch(/is required/);
          });

        // token is invaild schema
        await request(app)
          .post(`/api/v1/auth/refresh-token`)
          .send({ refreshToken: '12' })
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
      });
    });

    describe('given the token is valid', () => {
      it('should return a 200 status with refresh and access token', async () => {
        await User.create({
          ...userPayload,
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

        if (authResponse && authResponse?.body?.data?.refreshToken) {
          await request(app)
            .post(`/api/v1/auth/refresh-token`)
            .send({ refreshToken: authResponse?.body?.data?.refreshToken })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                data: expect.any(Object),
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });
              expect(response.body?.data?.user).toHaveProperty('accessToken');
              expect(response.body?.data?.user).toHaveProperty('refreshToken');
              expect(response?.body?.message).toMatch(/logged in successful/);
            });
        }
      });
    });
  });

  /**
   * Testing auth forget password endpoint
   */
  describe('POST /api/v1/auth/forget-password', () => {
    describe('given the email is invaild or missing', () => {
      it('should return a 422 status with validation message', async () => {
        // email is missing
        await request(app)
          .post(`/api/v1/auth/forget-password`)
          .send({})
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
            expect(response?.body?.message).toMatch(/is required/);
          });

        // email is invaild schema
        await request(app)
          .post(`/api/v1/auth/forget-password`)
          .send({ email: 'invaild' })
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
            expect(response?.body?.message).toMatch(/must be a valid email/);
          });
      });
    });

    describe('given the email does not exist in DB ', () => {
      it('should return a 401 status with validation message', async () => {
        await request(app)
          .post(`/api/v1/auth/forget-password`)
          .send({ email: 'email@gmail.com' })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 401,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/not associated with any account/);
          });
      });
    });

    describe('given the email is valid', () => {
      it('should send reset password link to user email and return a 200 status with reset password link', async () => {
        await User.create({
          ...userPayload,
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

        if (authResponse && authResponse?.body?.data?.refreshToken) {
          await request(app)
            .post(`/api/v1/auth/forget-password`)
            .send({ email: userPayload.email })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                data: expect.any(Object),
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });
              expect(response.body?.data?.user).toHaveProperty('resetPasswordToken');

              // Check if the email is really been called
              // @ts-ignore
              expect(sendEmailModule?.sendResetPasswordEmail?.mock?.calls?.length).toBe(1);

              expect(sendEmailModule?.sendResetPasswordEmail).toHaveBeenCalled();
            });
        }
      });
    });
  });

  /**
   * Testing auth reset password endpoint
   */
  describe('GET /api/v1/auth/reset-password/:userId/:token', () => {
    describe('given the userId or token is invaild', () => {
      it('should return a 422 status with validation message', async () => {
        // token is invaild schema
        await request(app)
          .post(`/api/v1/auth/reset-password/${validMongooseObjectId}/to`)
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

    describe('given password or confirmPassword is missing', () => {
      it('should return a 422 status with validation message', async () => {
        // password is missing
        await request(app)
          .post(`/api/v1/auth/reset-password/${validMongooseObjectId}/${validMongooseObjectId}`)
          .send({ confirmPassword: 'password' })
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

        // confirmPassword is missing
        await request(app)
          .post(`/api/v1/auth/reset-password/${validMongooseObjectId}/${validMongooseObjectId}`)
          .send({ password: '123456' })
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
            expect(response?.body?.message).toMatch(/confirmPassword/);
          });
      });
    });

    describe('given the password is less than 6 characters', () => {
      it('should return a 422 status with validation message', async () => {
        await request(app)
          .post(`/api/v1/auth/reset-password/${validMongooseObjectId}/${validMongooseObjectId}`)
          .send({ password: '123' })
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
            expect(response?.body?.message).toMatch(/length must be at least 6 characters long/);
          });
      });
    });

    describe('given the confirmPassword do not match', () => {
      it('should return a 422 status with validation message', async () => {
        await request(app)
          .post(`/api/v1/auth/reset-password/${validMongooseObjectId}/${validMongooseObjectId}`)
          .send({
            password: 'password',
            confirmPassword: 'confirmPassword',
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
            expect(response?.body?.message).toMatch(/confirmPassword/);
          });
      });
    });

    describe('given the user id or refresh token is invaild or expired', () => {
      it('should return a 401 status with message token is invalid or has expired', async () => {
        const newUser = await User.create({
          ...userPayload,
          isVerified: false,
        });

        await request(app)
          .post(`/api/v1/auth/reset-password/${newUser?._id}/${validMongooseObjectId}`)
          .send({
            password: 'password',
            confirmPassword: 'password',
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 401,
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
          });
          const authResponse = await request(app)
            .post(`/api/v1/auth/forget-password`)
            .send({ email: userPayload.email })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect('Content-Type', /json/);
          if (authResponse && authResponse?.body?.data?.user?.resetPasswordToken) {
            // Link example
            // http://localhost:50050/reset-password?id=63ce6eccda4c8c9c390418a8&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2NlNmVjY2RhNGM4YzljMzkwNDE4YTgiLCJpYXQiOjE2NzQ0NzMxNjUsImV4cCI6MTY3NDQ3NDk2NSwiYXVkIjoiNjNjZTZlY2NkYTRjOGM5YzM5MDQxOGE4IiwiaXNzIjoidGVzdG5kb2Vqcy5jb20ifQ.2xdT4c8-bjEI3Do9VGuJ12w7jkxhZlMYbw4cW5r09jg

            const fullLink = authResponse?.body?.data?.user?.resetPasswordToken?.split('reset-password?')[1];
            const splitLink = fullLink?.split('&token=');
            const token = splitLink[1];
            const id = splitLink[0].split('id=')[1];

            await request(app)
              .post(`/api/v1/auth/reset-password/${id}/${token}`)
              .send({
                password: 'password',
                confirmPassword: 'password',
              })
              .set('Accept', 'application/json')
              .set('Content-Type', 'application/json')
              .expect('Content-Type', /json/)
              .then((response) => {
                expect(response.body).toMatchObject({
                  data: expect.any(Object),
                  success: true,
                  error: false,
                  message: expect.any(String),
                  status: 200,
                });
                expect(response?.body?.message).toMatch(/password has been Password Reset/);

                // Check if confirmation email has been send
                // @ts-ignore
                expect(sendEmailModule?.sendConfirmResetPasswordEmail?.mock?.calls?.length).toBe(1);
                expect(sendEmailModule?.sendConfirmResetPasswordEmail).toHaveBeenCalled();
              });
          }
        } catch (error) {
          console.log('rest password - given the userId and token are valid filed ', error);
        }
      });
    });
  });

  /**
   * Testing follow user endpoint
   */
  describe('PUT  /api/v1/user/:userId/follow', () => {
    cloudinary.v2.uploader.destroy = jest.fn().mockResolvedValue({ success: true });

    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .put('/api/v1/users/63d7d3ce0ba02465093d3d36/follow')
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
          );
      });
    });

    describe('given invaild user id', () => {
      it('should return a 422 status with validation message', async () => {
        const newUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });
        await newUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .put(`/api/v1/users/invaildid/follow`)
            .set('Authorization', `Bearer ${token}`)
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 422,
                message: expect.any(String),
                stack: expect.any(String),
              });
              expect(response?.body?.message).toMatch(/fails to match the valid mongo id pattern/);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given the user does not exist', () => {
      it('should return a 400 status with a json message - bad request', async () => {
        const newUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });
        await newUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .put(`/api/v1/users/${validMongooseObjectId}/follow`)
            .set('Authorization', `Bearer ${token}`)
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                success: false,
                error: true,
                message: expect.any(String),
                status: 400,
                stack: expect.any(String),
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given the user is trying to follow themselves', () => {
      it('should return a 403 status with a json message - You cant follow yourself', async () => {
        const newUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });
        await newUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        const userId = (authResponse && authResponse?.body?.data?.user?._id) || '';

        if (userId && token) {
          await request(app)
            .put(`/api/v1/users/${userId}/follow`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 403,
                message: expect.any(String),
                stack: expect.any(String),
              });
              expect(response?.body?.message).toMatch('cannot follow yourself');
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given the user is already been followed', () => {
      it('should return a 403 status with a json message - You already follow this user', async () => {
        const currentUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        await currentUser.save();

        const toBeFollowedUser = new User({
          ...userPayload,
          followers: [currentUser?._id],
        });
        await toBeFollowedUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (toBeFollowedUser?._id && token) {
          await request(app)
            .put(`/api/v1/users/${toBeFollowedUser?._id}/follow`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 403,
                message: expect.any(String),
                stack: expect.any(String),
              });
              expect(response?.body?.message).toMatch('already followed this user');
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given the user is logged in and authorized and the given userId to follow does exist in DB', () => {
      it('should return a 200 status with the followed user', async () => {
        const currentUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        await currentUser.save();

        const toBeFollowedUser = new User({
          ...userPayload,
        });

        await toBeFollowedUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (toBeFollowedUser?._id && token) {
          await request(app)
            .put(`/api/v1/users/${toBeFollowedUser?._id}/follow`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });
              expect(response?.body?.message).toMatch('has been followed successfully');
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  });

  /**
   * Testing un follow user endpoint
   */
  describe('PUT  /api/v1/user/:userId/un-follow', () => {
    cloudinary.v2.uploader.destroy = jest.fn().mockResolvedValue({ success: true });

    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .put('/api/v1/users/63d7d3ce0ba02465093d3d36/un-follow')
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
          );
      });
    });

    describe('given invaild user id', () => {
      it('should return a 422 status with validation message', async () => {
        const newUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });
        await newUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .put(`/api/v1/users/invaildid/un-follow`)
            .set('Authorization', `Bearer ${token}`)
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 422,
                message: expect.any(String),
                stack: expect.any(String),
              });
              expect(response?.body?.message).toMatch(/fails to match the valid mongo id pattern/);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given the user does not exist', () => {
      it('should return a 400 status with a json message - bad request', async () => {
        const newUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });
        await newUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .put(`/api/v1/users/${validMongooseObjectId}/follow`)
            .set('Authorization', `Bearer ${token}`)
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                success: false,
                error: true,
                message: expect.any(String),
                status: 400,
                stack: expect.any(String),
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given the user is trying to un follow themselves', () => {
      it('should return a 403 status with a json message - You cant un follow yourself', async () => {
        const newUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });
        await newUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        const userId = (authResponse && authResponse?.body?.data?.user?._id) || '';

        if (userId && token) {
          await request(app)
            .put(`/api/v1/users/${userId}/un-follow`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 403,
                message: expect.any(String),
                stack: expect.any(String),
              });
              expect(response?.body?.message).toMatch('cant un follow yourself');
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given the user is not been followed', () => {
      it("should return a 403 status with a json message - You haven't follow this user before", async () => {
        const currentUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        await currentUser.save();

        const toBeUnFollowedUser = new User({
          ...userPayload,
        });
        await toBeUnFollowedUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (toBeUnFollowedUser?._id && token) {
          await request(app)
            .put(`/api/v1/users/${toBeUnFollowedUser?._id}/un-follow`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 403,
                message: expect.any(String),
                stack: expect.any(String),
              });
              expect(response?.body?.message).toMatch("haven't follow this user before");
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given the user is logged in and authorized and the given userId to un follow does exist in DB and already been followed', () => {
      it('should return a 200 status with user profile with out un followed user', async () => {
        const currentUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        await currentUser.save();

        const toBeUnFollowedUser = new User({
          ...userPayload,
          followers: [currentUser?._id],
        });
        await toBeUnFollowedUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (toBeUnFollowedUser?._id && token) {
          await request(app)
            .put(`/api/v1/users/${toBeUnFollowedUser?._id}/un-follow`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });
              expect(response?.body?.message).toMatch('has been un followed successfully');
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  });
});
