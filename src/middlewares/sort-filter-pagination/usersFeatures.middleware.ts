import { NextFunction } from 'express';

import userModel from '@src/models/User.model';
import { TPaginationRequest, TPaginationResponse } from '@src/interfaces';

export const usersPaginationMiddleware = () => {
  return async (req: TPaginationRequest, res: TPaginationResponse, next: NextFunction) => {
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

    const totalCount = await userModel.countDocuments().exec();
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

    // Sort
    const sort: any = {};

    if (req.query.sortBy && req.query.orderBy) {
      sort[req.query.sortBy] = req.query.orderBy.toLowerCase() === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    // Filter
    let filter: any = {};

    if (req.query.filterBy && req.query.role) {
      console.log(req.query);
      if (req.query.role.toLowerCase() === 'admin') {
        filter.$or = [{ role: 'admin' }];
      } else if (req.query.role.toLowerCase() === 'user') {
        filter.$or = [{ role: 'user' }];
      } else if (req.query.role.toLowerCase() === 'manger') {
        filter.$or = [{ role: 'manger' }];
      } else if (req.query.role.toLowerCase() === 'guide') {
        filter.$or = [{ role: 'guide' }];
      } else if (req.query.role.toLowerCase() === 'moderator') {
        filter.$or = [{ role: 'moderator' }];
      } else if (req.query.role.toLowerCase() === 'all') {
        filter = {};
      } else {
        filter = {};
      }
    }

    // Search
    if (req.query.search) {
      filter = {
        $or: [
          { name: { $regex: req.query.search } },
          { nationality: { $regex: req.query.search } },
          { email: { $regex: req.query.search } },
          { gender: { $regex: req.query.search } },
          { role: { $regex: req.query.search } },
          { dateOfBirth: { $regex: req.query.search } },
        ],
      };
    }

    try {
      results.results = await userModel
        .find(filter)
        .select(
          'name  surname email dateOfBirth gender   isVerified  profileImage  mobileNumber  status role  companyName   acceptTerms nationality  favoriteAnimal  address  profileImage bio jobTitle status cart'
        )
        .populate('cart.items.productId')
        .limit(limit)
        .sort(sort)
        .skip(startIndex)
        .exec();

      // Add paginated Results to the request
      res.paginatedResults = results;
      next();
    } catch (error) {
      return next(error);
    }
  };
};

export default usersPaginationMiddleware;
