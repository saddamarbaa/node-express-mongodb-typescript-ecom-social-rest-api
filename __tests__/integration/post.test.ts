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

    describe('given the user is logged in and authorized and the post does exist but not been liked by user before', () => {
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

    describe('given the user is logged in and authorized and the post does exist and been liked by the user before', () => {
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

    describe('given the post id is less than 3 characters', () => {
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

    describe('given the user is logged in and authorized and the post does exist', () => {
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

  /**
   * Testing update comment post endpoint
   */
  describe('PATCH  /api/v1/feed/posts/comment', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .patch('/api/v1/feed/posts/comment')
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

    describe('given any of the flowing filed is missing (postId,commentId,comment)', () => {
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
            .patch('/api/v1/feed/posts/comment')
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
            .patch('/api/v1/feed/posts/comment')
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

          // commentId is missing
          await request(app)
            .patch('/api/v1/feed/posts/comment')
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
            .patch('/api/v1/feed/posts/comment')
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

          // commentId not vaild
          await request(app)
            .patch('/api/v1/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: validMongooseObjectId, commentId: 'notcorrectid', comment: 'css' })
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

    describe('given the comment is less than 3 characters', () => {
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
            .patch('/api/v1/feed/posts/comment')
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
            .patch('/api/v1/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: validMongooseObjectId, commentId: validMongooseObjectId, comment: 'css' })
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
            .patch('/api/v1/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: post?._id, commentId: validMongooseObjectId, comment: 'css' })
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
      it('should update the comment and return a 200 status with the updated post', async () => {
        const user = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        await user.save();

        const oldComment = 'oldComment';
        const updatedComment = 'updatedComment';

        const post = new Post({
          ...postPayload,
          author: user._id,
          comments: [
            {
              user: user?._id,
              comment: oldComment,
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
            .patch('/api/v1/feed/posts/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ postId: post?._id, commentId: post?.comments[0]?._id, comment: updatedComment })
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });

              expect(response?.body?.message).toMatch('Successfully update comment');
              expect(response?.body?.data?.post?.comments[0]?.comment).toMatch(updatedComment);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  });

  /**
   * Testing get single comment endpoint
   */
  describe('GET  /api/v1/feed/posts/comment/{postId}/{commentId}', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .get('/api/v1/feed/posts/comment/postId/commentId')
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
            .get(`/api/v1/feed/posts/comment/notvaild/${validMongooseObjectId}`)
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

          // commentId not vaild
          await request(app)
            .get(`/api/v1/feed/posts/comment/notvaild/${validMongooseObjectId}`)
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
            .get(`/api/v1/feed/posts/comment/${validMongooseObjectId}/${validMongooseObjectId}`)
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

    describe('given the user is logged in and authorized and the given post does exist in DB but not the comment does not exist', () => {
      it('should return a 400 status with a json message', async () => {
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
            .get(`/api/v1/feed/posts/comment/${post?._id}/${validMongooseObjectId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
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

    describe('given the user is logged in and authorized and the post and comment does exist', () => {
      it('should return a 200 status with the post with only one comment', async () => {
        const user = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        await user.save();

        const testComment = 'testComment';
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
              comment: testComment,
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
            .get(`/api/v1/feed/posts/comment/${post?._id}/${post?.comments[1]?._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });
              expect(response?.body?.message).toMatch('Successfully found comment');
              expect(response?.body?.data?.comment?.comment).toMatch(testComment);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  });

  /**
   * Testing get all comments in post endpoint
   */
  describe.only('GET /api/v1/feed/posts/comment/{postId}/{commentId}', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .get('/api/v1/feed/posts/comment/postId')
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
            .get(`/api/v1/feed/posts/comment/notvaild`)
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
            .get(`/api/v1/feed/posts/comment/${validMongooseObjectId}`)
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
      it('should return a 200 status and array of comments', async () => {
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
            .get(`/api/v1/feed/posts/comment/${post?._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });
              expect(response?.body?.data?.comments?.length).toBe(2);
              expect(response?.body?.message).toMatch('found all comments');
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  });
});
