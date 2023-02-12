import express from 'express';

import {
  addCommentInPostController,
  createPostController,
  deleteAllCommentInPostController,
  deleteUserCommentInPostController,
  deleteCommentInPostController,
  deletePostController,
  deleteUserPostsController,
  getAllCommentInPostController,
  getUserCommentInPostController,
  getCommentInPostController,
  getPostController,
  getPostsController,
  getUserPostsController,
  likePostController,
  updateCommentInPostController,
  updatePostController,
  getTimelinePostsController,
} from '@src/controllers';
import {
  addCommentValidation,
  addPostValidation,
  commentIdValidation,
  deleteCommentValidation,
  isAuth,
  postIdValidation,
  postPaginationMiddleware,
  updateCommentValidation,
  updatePostValidation,
  uploadImage,
} from '@src/middlewares';

const router = express.Router();

router.get('/posts', postPaginationMiddleware(), getPostsController);
router.get('/posts/user-posts', isAuth, getUserPostsController);
router.get('/posts/timeline', isAuth, getTimelinePostsController);
router.delete('/posts/user-posts', isAuth, deleteUserPostsController);
router.put('/posts/comment', isAuth, addCommentValidation, addCommentInPostController);
router.patch('/posts/comment', isAuth, updateCommentValidation, updateCommentInPostController);
router.delete('/posts/comment', isAuth, deleteCommentValidation, deleteCommentInPostController);
router.delete('/posts/comment/:postId', isAuth, updatePostValidation, deleteAllCommentInPostController);
router.delete('/posts/user-comment/:postId', isAuth, postIdValidation, deleteUserCommentInPostController);
router.get(
  '/posts/comment/:postId/:commentId',
  isAuth,
  postIdValidation,
  commentIdValidation,
  getCommentInPostController
);
router.get('/posts/comment/:postId', isAuth, postIdValidation, getAllCommentInPostController);
router.get('/posts/user-comment/:postId', isAuth, updatePostValidation, getUserCommentInPostController);
router.get('/posts/:postId', postIdValidation, getPostController);
router.delete('/posts/:postId', isAuth, postIdValidation, deletePostController);
router.patch('/posts/:postId', uploadImage.single('postImage'), isAuth, updatePostValidation, updatePostController);
router.post('/posts', uploadImage.single('postImage'), isAuth, addPostValidation, createPostController);
router.put('/posts/:postId/like', isAuth, postIdValidation, likePostController);

export = router;
