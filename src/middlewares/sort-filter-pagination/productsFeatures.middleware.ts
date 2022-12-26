import { NextFunction } from 'express';

import productModel from '@src/models/Product.model';
import { TPaginationRequest, TPaginationResponse } from '@src/interfaces';
import { productCategory } from '@src/constants';

export const productsPaginationMiddleware = () => {
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

    const totalCount = await productModel.countDocuments().exec();
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

    if (req.query.filterBy && req.query.category) {
      // console.log(req.query.category.toLowerCase());
      if (req.query.category.toLowerCase() === productCategory.sport) {
        filter.$or = [{ category: productCategory.sport }];
      } else if (req.query.category.toLowerCase() === productCategory.football) {
        filter.$or = [{ category: productCategory.football }];
      } else if (req.query.category.toLowerCase() === productCategory.womenClothe) {
        filter.$or = [{ category: productCategory.womenClothe }];
      } else if (req.query.category.toLowerCase() === productCategory.womenShoe) {
        filter.$or = [{ category: productCategory.womenShoe }];
      } else if (req.query.category.toLowerCase() === productCategory.jewelery) {
        filter.$or = [{ category: productCategory.jewelery }];
      } else if (req.query.category.toLowerCase() === productCategory.menClothe) {
        filter.$or = [{ category: productCategory.menClothe }];
      } else if (req.query.category.toLowerCase() === productCategory.menShoe) {
        filter.$or = [{ category: productCategory.menShoe }];
      } else if (req.query.category.toLowerCase() === productCategory.PersonalComputer) {
        filter.$or = [{ category: productCategory.PersonalComputer }];
      } else if (req.query.category.toLowerCase() === productCategory.electronic) {
        filter.$or = [{ category: productCategory.electronic }];
      } else if (req.query.category.toLowerCase() === productCategory.book) {
        filter.$or = [{ category: productCategory.book }];
      } else if (req.query.category.toLowerCase() === productCategory.toy) {
        filter.$or = [{ category: productCategory.toy }];
      } else if (req.query.category.toLowerCase() === productCategory.all) {
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
      results.results = await productModel
        .find(filter)
        .select(
          'name description price brand category  stock numberOfReviews ratings reviews productImage createdAt updatedAt'
        )
        .populate(
          'user',
          'name  surname email dateOfBirth gender   isVerified  profileImage  mobileNumber  status role  companyName   acceptTerms nationality  favoriteAnimal  address  profileImage bio jobTitle status'
        ) // populate return merge result
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

export default productsPaginationMiddleware;
