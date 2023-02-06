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

describe('Admin', () => {
  /**
   * Testing admin delete all comments in post endpoint
   */
  describe('DELETE /api/v1/admin/feed/posts/comment/{postId}/{commentId}', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .delete('/api/v1/admin/feed/posts/comment/postId')
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
          // postId not vaild
          await request(app)
            .delete(`/api/v1/admin/feed/posts/comment/notvaild`)
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
            .delete(`/api/v1/admin/feed/posts/comment/${validMongooseObjectId}`)
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

    describe('given the user is logged in and authorized and the post does exist', () => {
      it('should remove all the comment from post and return 200 status', async () => {
        const user = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        await user.save();

        const post = new Post({
          ...postPayload,
          author: user._id,
          comments: [
            {
              user: user?._id,
              comment: 'test',
            },
            {
              user: user?._id,
              comment: 'test',
            },
            {
              user: user?._id,
              comment: 'test',
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

        if (post && token) {
          await request(app)
            .delete(`/api/v1/admin/feed/posts/comment/${post?._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });
              expect(response?.body?.data?.post?.comments?.length).toBe(0);
              expect(response?.body?.message).toMatch('deleted all comments');
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  });

  /**
   * Testing admin delete one comment in post endpoint
   */
  describe('DELETE  /api/v1/admin/feed/posts/comment', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .delete('/api/v1/admin/feed/posts/comment')
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

    describe('given any of the flowing filed is missing (postId,commentId)', () => {
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
          // postId is missing
          await request(app)
            .delete('/api/v1/admin/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({})
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

          // commentId is missing
          await request(app)
            .delete('/api/v1/admin/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ comment: 'comment', postId: validMongooseObjectId })
            .then((response) => {
              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 422,
                message: expect.any(String),
                stack: expect.any(String),
              });
              expect(response?.body?.message).toMatch(/commentId/);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });

    describe('given post id or comment id is not valid ', () => {
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
          // postId not vaild
          await request(app)
            .delete('/api/v1/admin/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: 'notvaild' })
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

          // commentId not vaild
          await request(app)
            .delete('/api/v1/admin/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: validMongooseObjectId, commentId: 'notcorrectid' })
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
            .delete('/api/v1/admin/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: validMongooseObjectId, commentId: validMongooseObjectId })
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

    describe('given the user is logged in and authorized and the given post does exist in DB but not the comment does not exist', () => {
      it('should return a 403 status with a json message - Auth Failed', async () => {
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
            .delete('/api/v1/admin/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: post?._id, commentId: validMongooseObjectId })
            .expect('Content-Type', /json/)
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

    describe('given the user is logged in and authorized and the post and comment does exist', () => {
      it('should delete the comment and return a 200 status with the updated post', async () => {
        const user = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        await user.save();

        const comment = 'comment';

        const post = new Post({
          ...postPayload,
          author: user._id,
          comments: [
            {
              user: user?._id,
              comment,
            },
            {
              user: user?._id,
              comment,
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

        if (post && token) {
          await request(app)
            .delete('/api/v1/admin/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: post?._id, commentId: post?.comments[0]?._id })
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });

              expect(response?.body?.message).toMatch('Successfully delete comment');
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
