import express from 'express';

import { createPostController, getPostsController } from '@src/controllers';
import { addPostValidation, isAuth, postPaginationMiddleware, uploadImage } from '@src/middlewares';

const router = express.Router();

router.get('/posts', postPaginationMiddleware(), getPostsController);

router.post('/posts', uploadImage.single('postImage'), isAuth, addPostValidation, createPostController);
export = router;
