import request from 'supertest';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';

import app from '@src/app';
import { environmentConfig } from '@src/configs';
import User from '@src/models/User.model';
import Post from '@src/models/Post.model';

import {
  adminEmails,
  authorizationRoles,
  postPayload,
  userPayload,
  validMongooseObjectId,
  correctFilePath as localFilePath,
} from '@src/constants';

beforeAll((done) => {
  jest.setTimeout(90 * 1000);
  mongoose.connect(environmentConfig.TEST_ENV_MONGODB_CONNECTION_STRING as string, {}, (err) => {
    if (err) return console.log('Failed to connect to DB', err);
    done();
  });

  jest.mock('@src/utils/sendEmail', () => ({
    sendEmailVerificationEmail: jest.fn().mockResolvedValue('Sending Email Success'),
  }));
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
   * Testing get all posts endpoint
   */
  describe('GET /api/v1/feed/posts', () => {
    describe('given no post in db', () => {
      it('should return a 200 status with a json contain empty array', async () => {
        request(app)
          .get('/api/v1/feed/posts')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body.data).toMatchObject({
              totalDocs: 0,
              totalPages: 0,
              lastPage: 0,
              count: 0,
              currentPage: { page: 1, limit: 20 },
              posts: [],
            });

            expect(response?.body?.message).toMatch('No post found');
          });
      });
    });

    describe('given added 3 posts in db', () => {
      it('should return a 200 status with a json contain array of 3 posts', async () => {
        const user = new User(userPayload);
        await user.save();
        const post = { ...postPayload, author: user._id };
        await Post.insertMany([post, post, post]);

        await request(app)
          .get('/api/v1/feed/posts')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: 'Successful Found posts',
              status: 200,
              data: {
                posts: expect.any(Array),
                totalDocs: expect.any(Number),
              },
            });
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });
  });

  /**
   * Testing get timeline posts endpoint
   */
  describe('GET /api/v1/feed/posts/timeline', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        const response = await request(app).get('/api/v1/feed/posts/timeline');

        expect(response.body).toMatchObject({
          data: null,
          success: false,
          error: true,
          message: expect.any(String),
          status: 401,
          stack: expect.any(String),
        });
      });
    });

    describe('given the user is logged in and authorized but no post exist in DB ', () => {
      it('should return a 200 status with a json contain empty array', async () => {
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
          try {
            const response = await request(app)
              .get('/api/v1/feed/posts/timeline')
              .set('Authorization', `Bearer ${token}`)
              .send({ postId: validMongooseObjectId, commentId: validMongooseObjectId });

            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: expect.any(String),
              status: 200,
            });
            expect(response?.body?.message).toMatch('No post found');
          } catch (error) {
            console.log(error);
          }
        }
      });
    });

    describe('given the user is logged and we have 10 posts in DB (2 for him,3 for the user that he is already following and 5 for users that are not following or friends)', () => {
      it('should return a 200 status with a json contain array of 5 posts', async () => {
        const authUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });
        const followedUser = new User(userPayload);
        const notFollowedUser = new User(userPayload);
        await authUser.save();
        await followedUser.save();

        const authPost = { ...postPayload, author: authUser._id };
        const followedUserPost = {
          ...postPayload,
          author: authUser._id,
          likes: {
            user: followedUser._id,
          },
        };
        const notFollowedUserPost = { ...postPayload, author: notFollowedUser._id };
        await Post.insertMany([
          authPost,
          authPost,
          followedUserPost,
          followedUserPost,
          followedUserPost,
          notFollowedUserPost,
          notFollowedUserPost,
          notFollowedUserPost,
          notFollowedUserPost,
          notFollowedUserPost,
        ]);

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            password: userPayload.password,
          });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          try {
            const response = await request(app)
              .get('/api/v1/feed/posts/timeline')
              .set('Authorization', `Bearer ${token}`)
              .send({ postId: validMongooseObjectId, commentId: validMongooseObjectId });

            expect(response?.body?.data?.posts?.length).toBe(5);
            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: expect.any(String),
              status: 200,
            });
            expect(response?.body?.message).toMatch('Successful Found posts');
          } catch (error) {
            console.log(error);
          }
        }
      });
    });
  });

  /**
   * Testing get user posts endpoint
   */
  describe('GET /api/v1/feed/posts/user-posts', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        const response = await request(app).get('/api/v1/feed/posts/user-posts');

        expect(response.body).toMatchObject({
          data: null,
          success: false,
          error: true,
          message: expect.any(String),
          status: 401,
          stack: expect.any(String),
        });
      });
    });

    describe('given no post in db', () => {
      it('should return a 200 status with a json contain empty array', async () => {
        try {
          const authUser = new User({
            ...userPayload,
          });

          await authUser.save();

          const authResponse = await request(app).post('/api/v1/auth/login').send({
            email: userPayload.email,
            password: userPayload.password,
          });

          const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

          if (token) {
            const response = await request(app)
              .get('/api/v1/feed/posts/user-posts')
              .set('Authorization', `Bearer ${token}`)
              .send({ postId: validMongooseObjectId, commentId: validMongooseObjectId });

            expect(response?.body?.data?.posts?.length).toBe(0);
            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: expect.any(String),
              status: 200,
            });
            expect(response?.body?.message).toMatch('No post found for user');
          }
        } catch (error) {
          console.log(error);
        }
      });
    });

    describe('given the user is logged in and has 3 post in DB', () => {
      it('should return a 200 status with a json contain array of 3 posts', async () => {
        try {
          const authUser = new User({
            ...userPayload,
          });

          const testUser = new User({
            ...userPayload,
            email: 'test@gmail.com',
          });

          const authPost = { ...postPayload, author: authUser._id };
          const testUserPost = { ...postPayload, author: testUser._id };

          await Post.insertMany([authPost, authPost, testUserPost, authPost]);

          await authUser.save();

          const authResponse = await request(app).post('/api/v1/auth/login').send({
            email: userPayload.email,
            password: userPayload.password,
          });

          const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

          if (token) {
            const response = await request(app)
              .get('/api/v1/feed/posts/user-posts')
              .set('Authorization', `Bearer ${token}`);

            expect(response?.body?.data?.posts?.length).toBe(3);
            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: expect.any(String),
              status: 200,
            });
            expect(response?.body?.message).toMatch('found all posts for user');
          }
        } catch (error) {
          console.log(error);
        }
      });
    });

    describe('given added 3 posts in db', () => {
      it('should return a 200 status with a json contain array of 3 posts', async () => {
        const user = new User(userPayload);
        await user.save();
        const post = { ...postPayload, author: user._id };
        await Post.insertMany([post, post, post]);

        await request(app)
          .get('/api/v1/feed/posts')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: 'Successful Found posts',
              status: 200,
              data: {
                posts: expect.any(Array),
                totalDocs: expect.any(Number),
              },
            });
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });
  });

  /**
   * Testing get single post endpoint
   */
  describe('GET /api/v1/feed/posts/:postId', () => {
    describe('given post id is not valid ', () => {
      it('should return a 422 status with validation message', async () => {
        // postId not vaild
        try {
          const response = await request(app).get(`/api/v1/feed/posts/notvaild`);
          expect(response.body).toMatchObject({
            data: null,
            error: true,
            status: 422,
            message: expect.any(String),
            stack: expect.any(String),
          });
          expect(response?.body?.message).toMatch(/fails to match the valid mongo id pattern/);
        } catch (error) {
          console.log(error);
        }
      });
    });

    describe('given the post does not exist', () => {
      it('should return a 400 status', async () => {
        try {
          const response = await request(app)
            .get(`/api/v1/feed/posts/${validMongooseObjectId}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
          expect(response.body).toMatchObject({
            data: null,
            success: false,
            error: true,
            message: 'Bad Request',
            status: 400,
            stack: expect.any(String),
          });
        } catch (error) {
          console.log(error);
        }
      });
    });

    describe('given the post does exist', () => {
      it('should return a 200 status and the product', async () => {
        try {
          const user = new User({
            ...userPayload,
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            role: authorizationRoles.admin,
          });

          await user.save();

          const post = new Post({
            ...postPayload,
            author: user._id,
          });
          await post.save();
          const response = await request(app)
            .get(`/api/v1/feed/posts/${post?._id}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

          expect(response?.body?.data?.post).toMatchObject(postPayload);

          expect(response.body).toMatchObject({
            success: true,
            error: false,
            message: expect.any(String),
            status: 200,
          });
        } catch (error) {
          console.log(error);
        }
      });
    });
  });

  /**
   * Testing delete post endpoint
   */
  describe('DELETE /api/v1/feed/posts/:postId', () => {
    cloudinary.v2.uploader.destroy = jest.fn().mockResolvedValue({ success: true });
    describe('given the user is logged in and authorized and the given postId to removed does exist in DB', () => {
      it('should return a 200 status with a json message - success', async () => {
        try {
          const user = new User({
            ...userPayload,
            email: (adminEmails && adminEmails[0]) || userPayload.email,
            role: authorizationRoles.admin,
          });
          await user.save();

          const post = new Post({
            ...postPayload,
            author: user._id,
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
            const response = await request(await app)
              .delete(`/api/v1/feed/posts/${post?._id}`)
              .set('Authorization', `Bearer ${token}`)
              .set('Accept', 'application/json')
              .set('Content-Type', 'application/json')
              .expect('Content-Type', /json/);

            return expect(response.body).toMatchObject({
              data: null,
              success: true,
              error: false,
              message: expect.any(String),
              status: 200,
            });
          }
        } catch (error) {
          console.log(error);
        }
      });
    });

    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        try {
          const response = await request(app).delete('/api/v1/feed/posts/userId');

          expect(response.body).toMatchObject({
            data: null,
            success: false,
            error: true,
            message: expect.any(String),
            status: 401,
            stack: expect.any(String),
          });
        } catch (error) {
          console.log(error);
        }
      });
    });

    describe('given the user is logged in but the given postId to removed does not exist in DB', () => {
      it('should return a 401 status with a json message - Bad Request', async () => {
        try {
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
            .expect('Content-Type', /json/);

          const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

          if (token) {
            const response = await request(app)
              .delete(`/api/v1/feed/posts/${validMongooseObjectId}`)
              .set('Authorization', `Bearer ${token}`)
              .set('Accept', 'application/json')
              .set('Content-Type', 'application/json')
              .expect('Content-Type', /json/);

            expect(response.body).toMatchObject({
              data: null,
              success: false,
              error: true,
              message: expect.any(String),
              status: 400,
            });
          }
        } catch (error) {
          console.log(error);
        }
      });
    });

    describe('given post id is not valid ', () => {
      it('should return a 422 status with validation message', async () => {
        try {
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
            const response = await request(app)
              .delete('/api/v1/feed/posts/postId')
              .set('Authorization', `Bearer ${token}`);

            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 422,
              message: expect.any(String),
              stack: expect.any(String),
            });
            expect(response?.body?.message).toMatch(/fails to match the valid mongo id pattern/);
          }
        } catch (error) {
          console.log(error);
        }
      });
    });

    describe('given the user is logged in and the given postId to removed does exist in DB but the user is Unauthorized to remove', () => {
      it('should return a 403 status with a json message - Unauthorized', async () => {
        const authUser = new User({
          ...userPayload,
        });

        const testEmail = 'test@gmail.com';
        const testUser = new User({
          ...userPayload,
          email: testEmail,
        });

        const post = new Post({
          ...postPayload,
          author: authUser._id,
        });

        await post.save();
        await testUser.save();
        await authUser.save();

        const authResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: testEmail,
            password: userPayload.password,
          })
          .expect(200);

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .delete(`/api/v1/feed/posts/${post._id}`)
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
  describe('GET /api/v1/feed/posts/comment/{postId}/{commentId}', () => {
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

  /**
   * Testing get auth user comments in post endpoint
   */
  describe('GET /api/v1/feed/posts/user-comment/{postId}', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .get('/api/v1/feed/posts/user-comment/postId')
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
          await request(app)
            .get(`/api/v1/feed/posts/user-comment/notvaild`)
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
            .get(`/api/v1/feed/posts/user-comment/${validMongooseObjectId}`)
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
            .get(`/api/v1/feed/posts/user-comment/${post?._id}`)
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
              expect(response?.body?.message).toMatch('found all your comment');
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  });

  /**
   * Testing delete all comments in post endpoint
   */
  describe('DELETE /api/v1/feed/posts/comment/{postId}/{commentId}', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .delete('/api/v1/feed/posts/comment/postId')
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
            .delete(`/api/v1/feed/posts/comment/notvaild`)
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
            .delete(`/api/v1/feed/posts/comment/${validMongooseObjectId}`)
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
            .delete(`/api/v1/feed/posts/comment/${post?._id}`)
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
   * Testing delete all comments of given user in given post endpoint
   */
  describe('DELETE /api/v1/feed/posts/comment/{postId}', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .delete('/api/v1/feed/posts/user-comment/postId')
          .send({
            userId: '63d7d3ef0ba02465093d3d39',
          })
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
            .delete('/api/v1/feed/posts/user-comment/postId')
            .send({
              userId: '63d7d3ef0ba02465093d3d39',
            })
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
            .delete(`/api/v1/feed/posts/user-comment/${validMongooseObjectId}`)
            .send({
              userId: '63d7d3ef0ba02465093d3d39',
            })
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
      it('should remove all comments which belong to the given user and return 200 status with updated post', async () => {
        const authUser = new User({
          ...userPayload,
          email: (adminEmails && adminEmails[0]) || userPayload.email,
          role: authorizationRoles.admin,
        });

        const testUser = new User({
          ...userPayload,
          email: 'test@gmail.com',
        });

        await testUser.save();
        await authUser.save();

        const post = new Post({
          ...postPayload,
          author: authUser._id,
          comments: [
            {
              user: authUser?._id,
              comment: 'test',
            },
            {
              user: authUser?._id,
              comment: 'test',
            },
            {
              user: testUser?._id,
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
            .delete(`/api/v1/feed/posts/user-comment/${post?._id}`)
            .send({
              userId: authUser?._id,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .then((response) => {
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 200,
              });
              expect(response?.body?.data?.post?.comments?.length).toBe(1);
              expect(response?.body?.message).toMatch('deleted all user comments');
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  });

  /**
   * Testing delete one comment in post endpoint
   */
  describe('DELETE /api/v1/feed/posts/comment/{postId}', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .delete('/api/v1/feed/posts/comment')
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
            .delete('/api/v1/feed/posts/comment')
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
            .delete('/api/v1/feed/posts/comment')
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
            .delete('/api/v1/feed/posts/comment')
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
            .delete('/api/v1/feed/posts/comment')
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
            .delete('/api/v1/feed/posts/comment')
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

        const post = new Post({
          ...postPayload,
          author: user._id,
          comments: [
            {
              user: user?._id,
              comment: 'tets',
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
            .delete('/api/v1/feed/posts/comment')
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
            .delete('/api/v1/feed/posts/comment')
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

  /**
   * Testing delete post endpoint
   */
  describe('DELETE /api/v1/feed/posts/{postId}', () => {
    beforeEach(async () => {
      cloudinary.v2.uploader.destroy = jest.fn().mockResolvedValue({ success: true });
    });

    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .delete('/api/v1/feed/posts/63e87ee')
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
            .delete('/api/v1/feed/posts/postId')
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
        });
        await newUser.save();

        const authResponse = await request(app).post('/api/v1/auth/login').send({
          email: userPayload.email,
          password: userPayload.password,
        });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .delete(`/api/v1/feed/posts/${validMongooseObjectId}`)
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

    describe('given the user is logged in and the post does exist in DB but the user is not authorized to remove that post', () => {
      it('should return a 403 status with a json message - unauthorized', async () => {
        const authorizedUser = new User({
          ...userPayload,
        });

        await authorizedUser.save();

        const unAuthorizedUser = new User({
          ...userPayload,
          email: 'authorized@fmail.com',
        });

        await unAuthorizedUser.save();

        const post = new Post({
          ...postPayload,
          author: authorizedUser._id,
        });
        await post.save();

        const authResponse = await request(app).post('/api/v1/auth/login').send({
          email: 'authorized@fmail.com',
          password: userPayload.password,
        });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .delete(`/api/v1/feed/posts/${post._id}`)
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

    describe('given the user is logged in and authorized and the post does exist', () => {
      it('should delete the post and return a 200 status', async () => {
        const authorizedUser = new User({
          ...userPayload,
        });

        await authorizedUser.save();

        const post = new Post({
          ...postPayload,
          author: authorizedUser._id,
        });
        await post.save();

        const authResponse = await request(app).post('/api/v1/auth/login').send({
          email: userPayload.email,
          password: userPayload.password,
        });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        expect.assertions(2);

        if (token) {
          try {
            const response = await request(app)
              .delete(`/api/v1/feed/posts/${post._id}`)
              .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: expect.any(String),
              status: 200,
            });
          } catch (error) {
            console.error(error);
          }
        }
      });
    });
  });

  /**
   * Testing update post endpoint
   */
  describe('PATCH  /api/v1/feed/posts/{postId}', () => {
    beforeEach(async () => {
      cloudinary.v2.uploader.destroy = jest.fn().mockResolvedValue({ success: true });
    });

    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        request(app)
          .patch('/api/v1/feed/posts/63e87ee')
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
            .patch('/api/v1/feed/posts/postId')
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
        });
        await newUser.save();

        const authResponse = await request(app).post('/api/v1/auth/login').send({
          email: userPayload.email,
          password: userPayload.password,
        });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .patch(`/api/v1/feed/posts/${validMongooseObjectId}`)
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

    describe('given the user is logged in and the post does exist in DB but the user is not authorized to update that post', () => {
      it('should return a 403 status with a json message - unauthorized', async () => {
        const authorizedUser = new User({
          ...userPayload,
        });

        await authorizedUser.save();

        const unAuthorizedUser = new User({
          ...userPayload,
          email: 'authorized@fmail.com',
        });

        await unAuthorizedUser.save();

        const post = new Post({
          ...postPayload,
          author: authorizedUser._id,
        });
        await post.save();

        const authResponse = await request(app).post('/api/v1/auth/login').send({
          email: 'authorized@fmail.com',
          password: userPayload.password,
        });

        const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

        if (token) {
          await request(app)
            .patch(`/api/v1/feed/posts/${post._id}`)
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

    describe('given the user is logged in and authorized and the given postId to updated does exist in DB', () => {
      it('should return a 200 status with the updated post', async () => {
        try {
          const authorizedUser = new User({
            ...userPayload,
          });

          await authorizedUser.save();

          const post = new Post({
            ...postPayload,
            author: authorizedUser._id,
          });
          await post.save();

          const authResponse = await request(app).post('/api/v1/auth/login').send({
            email: userPayload.email,
            password: userPayload.password,
          });

          const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

          const newTitle = 'newTitle';
          if (token) {
            const response = await request(app)
              .patch(`/api/v1/feed/posts/${post._id}`)
              .set('Authorization', `Bearer ${token}`)
              .field({
                title: newTitle,
              })
              .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response?.body?.data?.post?.title).toMatch(newTitle);

            expect(response.body).toMatchObject({
              success: true,
              error: false,
              message: expect.any(String),
              status: 200,
            });
          }
        } catch (error) {
          console.error(error);
        }
      });
    });
  });

  /**
   * Testing add post endpoint
   */
  describe('POST /api/v1/feed/posts/', () => {
    describe('given the user is not logged in', () => {
      it('should return a 401 status with a json message - Auth Failed', async () => {
        try {
          const response = await request(app).post('/api/v1/feed/posts').attach('postImage', localFilePath).expect(401);

          expect(response.body).toEqual({
            data: null,
            success: false,
            error: true,
            message: expect.any(String),
            status: 401,
            stack: expect.any(String),
          });
        } catch (error) {
          console.log(error);
        }
      });
    });

    describe('given the user is logged in and authorized', () => {
      describe('given any of the flowing filed is missing (title,content,postImage)', () => {
        it('should return a 422 status with validation message', async () => {
          try {
            const user = new User({
              ...userPayload,
            });

            await user.save();

            const authResponse = await request(app).post('/api/v1/auth/login').send({
              email: userPayload.email,
              password: userPayload.password,
            });

            const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

            if (token) {
              // Image is missing
              await request(app)
                .post('/api/v1/feed/posts')
                .field({
                  ...postPayload,
                })
                .set('Content-Type', 'multipart/form-data')
                .set('Authorization', `Bearer ${token}`)
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

              // title is missing
              await request(app)
                .post('/api/v1/feed/posts')
                .field({
                  content: postPayload.content,
                })
                .attach('postImage', localFilePath)
                .set('Content-Type', 'multipart/form-data')
                .set('Authorization', `Bearer ${token}`)
                .expect('Content-Type', /json/)
                .then((response) => {
                  expect(response.body).toMatchObject({
                    data: null,
                    error: true,
                    status: 422,
                    message: expect.any(String),
                    stack: expect.any(String),
                  });
                  expect(response?.body?.message).toMatch(/title/);
                });

              // content is missing
              await request(app)
                .post('/api/v1/feed/posts')
                .field({
                  title: postPayload.title,
                })
                .attach('postImage', localFilePath)
                .set('Content-Type', 'multipart/form-data')
                .set('Authorization', `Bearer ${token}`)
                .expect('Content-Type', /json/)
                .then((response) => {
                  expect(response.body).toMatchObject({
                    data: null,
                    error: true,
                    status: 422,
                    message: expect.any(String),
                    stack: expect.any(String),
                  });
                  expect(response?.body?.message).toMatch(/content/);
                });
            }
          } catch (error) {
            console.log(error);
          }
        });
      });

      describe('given the title is less than 3 characters', () => {
        it('should return a 422 status with validation message', async () => {
          try {
            const user = new User({
              ...userPayload,
            });

            await user.save();

            const authResponse = await request(app).post('/api/v1/auth/login').send({
              email: userPayload.email,
              password: userPayload.password,
            });

            const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

            if (token) {
              const response = await request(app)
                .post('/api/v1/feed/posts')
                .field({
                  title: 'tt',
                  content: postPayload.content,
                })
                .attach('postImage', localFilePath)
                .set('Content-Type', 'multipart/form-data')
                .set('Authorization', `Bearer ${token}`)
                .expect('Content-Type', /json/);

              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 422,
                message: expect.any(String),
                stack: expect.any(String),
              });
              expect(response?.body?.message).toMatch(/length must be at least 3 characters long/);
            }
          } catch (error) {
            console.log(error);
          }
        });
      });

      describe('given the content is less than 5 characters', () => {
        it('should return a 422 status with validation message', async () => {
          try {
            const user = new User({
              ...userPayload,
            });

            await user.save();

            const authResponse = await request(app).post('/api/v1/auth/login').send({
              email: userPayload.email,
              password: userPayload.password,
            });

            const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

            if (token) {
              const response = await request(app)
                .post('/api/v1/feed/posts')
                .field({
                  title: postPayload.title,
                  content: 'cont',
                })
                .attach('postImage', localFilePath)
                .set('Content-Type', 'multipart/form-data')
                .set('Authorization', `Bearer ${token}`)
                .expect('Content-Type', /json/);

              // Check that the response body matches the expected format
              expect(response.body).toMatchObject({
                data: null,
                error: true,
                status: 422,
                message: expect.any(String),
                stack: expect.any(String),
              });
              // Check that the validation message is correct
              expect(response.body.message).toMatch(/length must be at least 5 characters long/);
            }
          } catch (error) {
            console.log(error);
          }
        });
      });

      describe('given all the post information are valid', () => {
        it('should create post and return a 201 status', async () => {
          try {
            const user = new User({
              ...userPayload,
            });

            await user.save();

            const authResponse = await request(app).post('/api/v1/auth/login').send({
              email: userPayload.email,
              password: userPayload.password,
            });

            const token = (authResponse && authResponse?.body?.data?.accessToken) || '';

            if (token) {
              const response = await request(app)
                .post('/api/v1/feed/posts')
                .field({
                  title: postPayload.title,
                  content: postPayload.content,
                })
                .attach('postImage', localFilePath)
                .set('Content-Type', 'multipart/form-data')
                .set('Authorization', `Bearer ${token}`)
                .expect('Content-Type', /json/);

              // Check that the response body matches the expected format
              expect(response.body).toMatchObject({
                success: true,
                error: false,
                message: expect.any(String),
                status: 201,
              });

              expect(response?.body?.data?.post?.title).toMatch(postPayload.title);
            }
          } catch (error) {
            console.log(error);
          }
        });
      });
    });
  });
});
