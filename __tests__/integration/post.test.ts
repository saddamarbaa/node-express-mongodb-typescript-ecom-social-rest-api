import request from 'supertest';
import mongoose from 'mongoose';

import app from '@src/app';
import { environmentConfig } from '@src/configs';
import User from '@src/models/User.model';
import Post from '@src/models/Post.model';

import { adminEmails, authorizationRoles, postPayload, userPayload, validMongooseObjectId } from '@src/constants';

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
});

beforeEach(async () => {
  await Post.deleteMany({});
  await User.deleteMany({});
});

afterEach(async () => {
  await Post.deleteMany({});
  await User.deleteMany({});
});

describe('Post', () => {
  /**
   * Testing like/un-like post endpoint
   */
  describe('PUT  /api/v1/feed/posts/:postId/like', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .put('/api/v1/feed/posts/63d7d3ce0ba02465093d3d36/like')
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

    describe('given invaild post id', () => {
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
            .put('/api/v1/feed/posts/invalid/like')
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

    describe('given the post does not exist', () => {
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
            .put(`/api/v1/feed/posts/${validMongooseObjectId}/like`)
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

    describe('given the user is logged in and authorized and the given postId to like does exist in DB and not been liked by the same user before', () => {
      it('should return a 200 status with the liked post', async () => {
        const user = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        await user.save();

        const post = new Post({ ...postPayload, author: user._id });
        await post.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .put(`/api/v1/feed/posts/${post?._id}/like`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });

              expect(response?.body?.message).toMatch('Successfully liked post');
              expect(response?.body?.data?.post?.likes?.length).toBe(1);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given the post is already been liked by the same user before', () => {
      it('should unlike the post and return a 200 status with a json contain user info', async () => {
        const user = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        await user.save();

        const post = new Post({
          ...postPayload,
          author: user._id,
          likes: [
            {
              user: user?._id,
            },
          ],
        });
        await post.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .put(`/api/v1/feed/posts/${post?._id}/like`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });

              expect(response?.body?.message).toMatch('Successfully disliked post');
              expect(response?.body?.data?.post?.likes?.length).toBe(0);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  });

  /**
   * Testing add comment post endpoint
   */
  describe('PUT  /api/v1/feed/posts/comment', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .put('/api/v1/feed/posts/comment')
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

    describe('given any of the flowing filed is missing (postId,comment)', () => {
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
          // comment is missing
          await request(app)
            .put('/api/v1/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: validMongooseObjectId })
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 422,
                message: expect.any(String),
                stack: expect.any(String),
              });
              expect(response?.body?.message).toMatch(/comment/);
            })
            .catch((error) => {
              console.log(error);
            });

          // postId is missing
          await request(app)
            .put('/api/v1/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ comment: 'comment' })
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 422,
                message: expect.any(String),
                stack: expect.any(String),
              });
              expect(response?.body?.message).toMatch(/postId/);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given post id is not valid ', () => {
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
            .put('/api/v1/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: 'notvaild', comment: 'css' })
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

    describe('given the password is less than 3 characters', () => {
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
            .put('/api/v1/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: validMongooseObjectId, comment: 'c' })
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 422,
                message: expect.any(String),
                stack: expect.any(String),
              });
              expect(response?.body?.message).toMatch(/length must be at least 3 characters long/);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given the post does not exist', () => {
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
            .put('/api/v1/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: validMongooseObjectId, comment: 'test' })
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

    describe('given the user is logged in and authorized and the given postId to comment does exist in DB', () => {
      it('should add comment to the post and return a 200 status with the updated post', async () => {
        const user = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        await user.save();

        const post = new Post({ ...postPayload, author: user._id });
        await post.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .put('/api/v1/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: post?._id, comment: 'test' })
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });

              expect(response?.body?.message).toMatch('Successfully add comment');
              expect(response?.body?.data?.post?.comments?.length).toBe(1);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  });
});
