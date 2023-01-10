import { NextFunction, Request, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';

import { customResponse, deleteFile } from '@src/utils';

import { AuthenticatedRequestBody, IUser, PostT, TPaginationResponse } from '@src/interfaces';
import Post from '@src/models/Post.model';

export const getPostsService = async (_req: Request, res: TPaginationResponse) => {
  if (res?.paginatedResults) {
    const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;
    const responseObject: any = {
      totalDocs: totalDocs || 0,
      totalPages: totalPages || 0,
      lastPage: lastPage || 0,
      count: results?.length || 0,
      currentPage: currentPage || 0,
    };

    if (next) {
      responseObject.nextPage = next;
    }
    if (previous) {
      responseObject.prevPage = previous;
    }

    responseObject.posts = results?.map((postDoc: any) => {
      const { author, ...otherPostInfo } = postDoc._doc;
      return {
        ...otherPostInfo,
        creator: {
          _id: author._id,
          name: author.name,
          surname: author.surname,
          profileImage: author.profileImage,
        },
        request: {
          type: 'Get',
          description: 'Get one post with the id',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts/${postDoc._doc._id}`,
        },
      };
    });

    return res.status(200).send(
      customResponse<typeof responseObject>({
        success: true,
        error: false,
        message: responseObject.posts.length ? 'Successful Found posts' : 'No post found',
        status: 200,
        data: responseObject,
      })
    );
  }
};

export const createPostService = async (req: AuthenticatedRequestBody<PostT>, res: Response, next: NextFunction) => {
  const { title, content, category } = req.body;

  const postData = new Post({
    title,
    content,
    category: category?.toLocaleLowerCase(),
    postImage: `/static/uploads/posts/${req?.file?.filename}`,
    author: req?.user?._id || '',
  });

  try {
    const createdPost = await Post.create(postData);

    const data = {
      post: {
        ...createdPost._doc,
        author: undefined,
        creator: {
          _id: req?.user?._id || '',
          name: req?.user?.name || '',
          surname: req?.user?.surname || '',
          profileImage: req?.user?.profileImage || '',
        },
      },
      request: {
        type: 'Get',
        description: 'Get all posts',
        url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts`,
      },
    };

    return res.status(201).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully added new post`,
        status: 201,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const getPostService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.postId).populate('author').exec();

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    const { author, ...otherPostInfo } = post._doc;

    const data = {
      post: {
        ...otherPostInfo,
        author: undefined,
        creator: {
          _id: author._id,
          name: author.name,
          surname: author.surname,
          profileImage: author.profileImage,
        },
        request: {
          type: 'Get',
          description: 'Get all posts',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts`,
        },
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found post by ID: ${req.params.postId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const updatePostService = async (req: AuthenticatedRequestBody<PostT>, res: Response, next: NextFunction) => {
  const { title, content, category } = req.body;

  try {
    const post = await Post.findById(req.params.postId).populate('author').exec();

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    // Allow user to update only post which is created by them
    if (!req.user?._id.equals(post.author._id) && req?.user?.role !== 'admin') {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;

    if (req?.file?.filename) {
      post.postImage = `/static/uploads/posts/${req?.file?.filename}`;
      // Delete the old post image
      const fullImage = post.postImage || '';
      const imagePath = fullImage.split('/').pop() || '';
      const folderFullPath = `${process.env.PWD}/public/uploads/posts/${imagePath}`;
      deleteFile(folderFullPath);
    }

    const updatedPost = await post.save({ new: true });

    const data = {
      post: {
        ...updatedPost._doc,
        author: undefined,
        creator: {
          _id: req?.user?._id,
          name: req?.user?.name,
          surname: req?.user?.surname,
          profileImage: req?.user?.profileImage,
        },
        request: {
          type: 'Get',
          description: 'Get all posts',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts`,
        },
      },
    };

    return res.status(200).json(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully update post by ID ${req.params.postId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const deletePostService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.postId).populate('author').exec();

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    // Allow user to delete only post which is created by them
    if (!req.user?._id.equals(post.author._id) && req?.user?.role !== 'admin') {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }

    const isDeleted = await Post.findByIdAndRemove({
      _id: req.params.postId,
    });

    if (!isDeleted) {
      return next(createHttpError(400, `Failed to delete post by given ID ${req.params.postId}`));
    }

    const fullImage = post.postImage || '';
    const imagePath = fullImage.split('/').pop() || '';
    const folderFullPath = `${process.env.PWD}/public/uploads/posts/${imagePath}`;

    deleteFile(folderFullPath);

    return res.status(200).json(
      customResponse({
        data: null,
        success: true,
        error: false,
        message: `Successfully deleted post by ID ${req.params.postId}`,
        status: 200,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const getUserPostsService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const posts = await Post.find({
      author: req?.user?._id || '',
    })
      .populate('author')
      .exec();

    const data = {
      posts: posts?.map((postDoc: any) => {
        const { author, ...otherPostInfo } = postDoc._doc;
        return {
          ...otherPostInfo,
          creator: {
            _id: author._id,
            name: author.name,
            surname: author.surname,
            profileImage: author.profileImage,
          },
          request: {
            type: 'Get',
            description: 'Get one post with the id',
            url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts/${postDoc._doc._id}`,
          },
        };
      }),
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: posts.length
          ? `Successfully found all posts for user by ID ${req?.user?._id}`
          : `No post found for user by ID ${req?.user?._id}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};
