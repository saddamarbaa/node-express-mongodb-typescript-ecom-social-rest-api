import { NextFunction } from 'express';

import Model from '@src/models/Post.model';
import { TPaginationRequest, TPaginationResponse } from '@src/interfaces';

export const postPaginationMiddleware = () => {
  return async (req: TPaginationRequest, res: TPaginationResponse, next: NextFunction) => {
    try {
      // Filtering
      const queryObject: { [key: string]: string } = { ...req.query };
      const excludedFiled = ['sort', 'limit', 'page', 'field'];
      excludedFiled.forEach((ele: string) => delete queryObject[ele]);

      // Advance filtering (for gte/$lt/)
      let queryString = JSON.stringify(queryObject);
      const reg = /\bgte|gt|lte|lt\b/g;
      queryString = queryString.replace(reg, (matchString) => `$${matchString}`);

      // Search
      let searchQuery: any;
      if (req.query.search) {
        const searchText = req.query.search.toLowerCase();
        searchQuery = {
          $or: [
            { title: { $regex: searchText } },
            { content: { $regex: searchText } },
            { category: { $regex: searchText } },
          ],
        };
      }

      // Final filter and search
      let query = Model.find(req.query.search ? searchQuery : JSON.parse(queryString));

      // Pagination
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results: any = {
        currentPage: {
          page,
          limit,
        },
        totalDocs: 0,
      };

      const totalCount = await Model.countDocuments().exec();
      results.totalDocs = totalCount;

      if (endIndex < totalCount) {
        results.next = {
          page: page + 1,
          limit,
        };
      }

      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit,
        };
      }

      results.totalPages = Math.ceil(totalCount / limit);
      results.lastPage = Math.ceil(totalCount / limit);

      // If requested page don't exist
      if (req.query.page && Number(req.query.page) > Math.ceil(totalCount / limit)) {
        // throw new Error(`This page don't exist`);
      }

      // Final pagination query
      query = query.limit(limit).skip(startIndex);

      // Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        // (example for companied sort) sort(price ratings)

        // ?sort=-price,-ratings
        query = query.sort(sortBy);
      } else {
        query = query.sort('-createdAt');
      }

      // Fields Limiting
      if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');

        // ?filed=price,description,ratings
        query = query.select(fields);
      } else {
        query = query.select('-_v');
      }

      results.results = await query
        .populate('author', 'name  surname  profileImage  bio')
        .populate('likes.user', 'name  surname  profileImage bio')
        .populate('comments.user', 'name  surname  profileImage bio')
        .exec();
      // Add paginated Results to the request
      res.paginatedResults = results;
      next();
    } catch (error) {
      return next(error);
    }
  };
};
