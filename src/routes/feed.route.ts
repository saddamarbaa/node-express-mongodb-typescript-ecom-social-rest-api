import express from 'express';

import {
  createPostController,
  deletePostController,
  getPostController,
  getPostsController,
  getUserPostsController,
  updatePostController,
} from '@src/controllers';
import {
  addPostValidation,
  isAuth,
  postIdValidation,
  postPaginationMiddleware,
  updatePostValidation,
  uploadImage,
} from '@src/middlewares';

const router = express.Router();

router.get('/posts', postPaginationMiddleware(), getPostsController);
router.get('/posts/user-posts', isAuth, getUserPostsController);
router.get('/posts/:postId', postIdValidation, getPostController);
router.delete('/posts/:postId', isAuth, postIdValidation, deletePostController);
router.patch('/posts/:postId', uploadImage.single('postImage'), isAuth, updatePostValidation, updatePostController);
router.post('/posts', uploadImage.single('postImage'), isAuth, addPostValidation, createPostController);

export = router;
