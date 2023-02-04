import { NextFunction, Request, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';

import { customResponse, deleteFile } from '@src/utils';
import {
  AddCommentT,
  AuthenticatedRequestBody,
  IUser,
  LikeT,
  PostT,
  TPaginationResponse,
  UpdateCommentT,
  CommentT,
} from '@src/interfaces';
import Post from '@src/models/Post.model';
import { cloudinary } from '@src/middlewares';

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

  // console.log(req.body, req.file);

  try {
    let cloudinaryResult;
    if (req.file?.filename) {
      const localFilePath = `${process.env.PWD}/public/uploads/posts/${req.file?.filename}`;
      cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
        folder: 'posts',
      });

      // Remove file from local uploads folder
      deleteFile(localFilePath);
    }

    const postData = new Post({
      title,
      content,
      category: category?.toLocaleLowerCase(),
      postImage: cloudinaryResult?.secure_url,
      cloudinary_id: cloudinaryResult?.public_id,
      author: req?.user?._id || '',
    });

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
    // Remove file from local uploads folder
    if (req.file?.filename) {
      const localFilePath = `${process.env.PWD}/public/uploads/posts/${req.file?.filename}`;
      deleteFile(localFilePath);
    }
    return next(InternalServerError);
  }
};

export const getPostService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

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
    const post = await Post.findById(req.params.postId)
      .populate('author')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    // Allow user to update only post which is created by them
    if (!req.user?._id.equals(post.author._id) && req?.user?.role !== 'admin') {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }

    if (post.cloudinary_id && req.file?.filename) {
      // Delete the old image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinary_id);
    }

    let cloudinaryResult;
    if (req.file?.filename) {
      const localFilePath = `${process.env.PWD}/public/uploads/posts/${req.file?.filename}`;

      cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
        folder: 'posts',
      });

      deleteFile(localFilePath);
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.cloudinary_id = req.file?.filename ? cloudinaryResult?.public_id : post.cloudinary_id;
    post.postImage = req.file?.filename ? cloudinaryResult?.secure_url : post.postImage;

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

    // const fullImage = post.postImage || '';
    // const imagePath = fullImage.split('/').pop() || '';
    // const folderFullPath = `${process.env.PWD}/public/uploads/posts/${imagePath}`;

    // deleteFile(folderFullPath);

    // Delete image from cloudinary
    if (post.cloudinary_id) {
      await cloudinary.uploader.destroy(post.cloudinary_id);
    }

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
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
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

export const deleteUserPostsService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await Post.find({
      author: req?.user?._id || '',
    })
      .populate('author')
      .exec();

    if (!posts || !posts.length) {
      return next(new createHttpError.BadRequest());
    }

    const droppedUserPost = await Post.deleteMany({
      author: req?.user?._id,
    });

    if (droppedUserPost.deletedCount === 0) {
      return next(createHttpError(400, `Failed to delete post for given user by ID ${req?.user?._id}`));
    }

    // Remove all the images
    posts.forEach(async (post) => {
      if (post?.cloudinary_id) {
        await cloudinary.uploader.destroy(post?.cloudinary_id);
      }
    });

    return res.status(200).json(
      customResponse({
        data: null,
        success: true,
        error: false,
        message: `Successfully deleted all posts for user by ID ${req?.user?._id}`,
        status: 200,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const likePostService = async (req: AuthenticatedRequestBody<PostT>, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    const isAlreadyLiked = post.likes.some(function (like: LikeT) {
      if (like?.user.toString() === req.user?._id.toString()) return true;
      return false;
    });

    if (!isAlreadyLiked) {
      await post.updateOne({
        $push: {
          likes: {
            user: req.user?._id,
          },
        },
      });
    } else {
      await post.updateOne({ $pull: { likes: { user: req.user?._id } } });
    }

    const updatedPost = await Post.findById(req.params.postId)
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    const { author, ...otherPostInfo } = updatedPost._doc;

    const data = {
      post: {
        ...otherPostInfo,
        author: undefined,
        creator: author,
        request: {
          type: 'Get',
          description: 'Get all posts',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts`,
        },
      },
    };

    const message = isAlreadyLiked
      ? `Successfully disliked post by ID: ${req.params.postId}`
      : `Successfully liked post by ID: ${req.params.postId}`;
    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const addCommentInPostService = async (
  req: AuthenticatedRequestBody<AddCommentT>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, comment } = req.body;

    const newComment = {
      user: req.user?._id,
      comment,
    };

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            $each: [newComment],
            $position: 0,
          },
        },
      },
      {
        new: true,
      }
    )
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    const { author, ...otherPostInfo } = post._doc;

    const data = {
      post: {
        ...otherPostInfo,
        author: undefined,
        creator: author,
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
        message: `Successfully add comment to post by ID : ${postId} `,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const updateCommentInPostService = async (
  req: AuthenticatedRequestBody<UpdateCommentT>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, commentId, comment } = req.body;

    const post = await Post.findById(postId)
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    const isAlreadyComment = post.comments.find(
      (item: { user: IUser; _id: string }) =>
        item.user?._id.toString() === req.user?._id.toString() && item?._id.toString() === commentId.toString()
    );

    if (!isAlreadyComment) {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }

    post.comments.forEach((item: { user: IUser; _id: string }, index: number) => {
      if (item?._id.toString() === commentId) {
        const newComment = {
          user: item.user,
          _id: item._id,
          comment,
        };

        post.comments[index] = newComment;
      }
    });

    await post.save();

    const { author, ...otherPostInfo } = post._doc;

    const data = {
      post: {
        ...otherPostInfo,
        author: undefined,
        creator: author,
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
        message: `Successfully update comment  by ID : ${commentId} `,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const getCommentInPostService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId)
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    const isCommentExists = post.comments.find(
      (item: { user: IUser; _id: string }) => item?._id.toString() === commentId.toString()
    );

    if (!isCommentExists) {
      return next(new createHttpError.BadRequest());
    }

    post.comments = post.comments.filter(
      (item: { user: IUser; _id: string }) =>
        item.user?._id.toString() === req.user?._id.toString() && item?._id.toString() === commentId.toString()
    );

    const { comments } = post._doc;

    const data = {
      comment: comments[0],
      request: {
        type: 'Get',
        description: 'Get all posts',
        url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts`,
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found comment by ID : ${commentId} `,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const getAllCommentInPostService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post || !post.comments.length) {
      return next(new createHttpError.BadRequest());
    }

    const comments = post.comments.map((commentDoc: { _doc: CommentT }) => {
      return {
        ...commentDoc._doc,
        request: {
          type: 'Get',
          description: 'Get one comment with the id',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts/comment/${req.params.postId}/${commentDoc._doc._id}`,
        },
      };
    });

    const data = {
      comments,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found all comments for post by ID : ${req.params.postId} `,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};
