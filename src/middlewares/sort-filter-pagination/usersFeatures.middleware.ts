import { NextFunction } from 'express';

import userModel from '@src/models/User.model';
import { TPaginationRequest, TPaginationResponse } from '@src/interfaces';
import { authorizationRoles } from '@src/constants';

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
      if (req.query.role.toLowerCase() === authorizationRoles.admin) {
        filter.$or = [{ role: authorizationRoles.admin }];
      } else if (req.query.role.toLowerCase() === authorizationRoles.user) {
        filter.$or = [{ role: authorizationRoles.user }];
      } else if (req.query.role.toLowerCase() === authorizationRoles.manger) {
        filter.$or = [{ role: authorizationRoles.manger }];
      } else if (req.query.role.toLowerCase() === authorizationRoles.supervisor) {
        filter.$or = [{ role: authorizationRoles.supervisor }];
      } else if (req.query.role.toLowerCase() === authorizationRoles.client) {
        filter.$or = [{ role: authorizationRoles.client }];
      } else if (req.query.role.toLowerCase() === authorizationRoles.guide) {
        filter.$or = [{ role: authorizationRoles.guide }];
      } else if (req.query.role.toLowerCase() === authorizationRoles.moderator) {
        filter.$or = [{ role: authorizationRoles.moderator }];
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
          'name  surname email dateOfBirth gender isVerified  profileImage  mobileNumber  status role  companyName   acceptTerms nationality  favoriteAnimal  address  profileImage bio jobTitle status cart '
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
