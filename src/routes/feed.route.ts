import express from 'express';

import { createPostController, getPostController, getPostsController } from '@src/controllers';
import { addPostValidation, isAuth, postIdValidation, postPaginationMiddleware, uploadImage } from '@src/middlewares';

const router = express.Router();

router.get('/posts', postPaginationMiddleware(), getPostsController);
router.get('/posts/:postId', postIdValidation, getPostController);
router.post('/posts', uploadImage.single('postImage'), isAuth, addPostValidation, createPostController);
export = router;
