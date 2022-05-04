const paginatedResults = model => {
  return async (req, res, next) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {
      currentPage: {
        page: page,
        limit: limit
      }
    };

    const totalCount = await model.countDocuments().exec();

    results.totalDocs = totalCount;
    if (endIndex < totalCount) {
      results.next = {
        page: page + 1,
        limit: limit
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      };
    }

    results.totalPages = Math.ceil(totalCount / limit);
    results.lastPage = Math.ceil(totalCount / limit);

    // Sort
    const sort = {};
    if (req.query.sortBy && req.query.OrderBy) {
      sort[req.query.sortBy] = req.query.OrderBy.toLowerCase() === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    // Filter
    let filter = {};
    if (req.query.filterBy && req.query.category) {
      console.log(req.query.category.toLowerCase());
      if (req.query.category.toLowerCase() === 'sports') {
        filter.$or = [{ category: 'Sports' }];
      } else if (req.query.category.toLowerCase() === 'football') {
        filter.$or = [{ category: 'Football' }];
      } else if (req.query.category.toLowerCase() === "women's clothing") {
        filter.$or = [{ category: "Women's clothing" }];
      } else if (req.query.category.toLowerCase() === "women's shoes") {
        filter.$or = [{ category: "Women's Shoes" }];
      } else if (req.query.category.toLowerCase() === 'jewelery') {
        filter.$or = [{ category: 'Jewelery' }];
      } else if (req.query.category.toLowerCase() === "men's clothing") {
        filter.$or = [{ category: "Men's clothing" }];
      } else if (req.query.category.toLowerCase() === "men's shoes") {
        filter.$or = [{ category: "Men's Shoes" }];
      } else if (req.query.category.toLowerCase() === 'personal computers') {
        filter.$or = [{ category: 'Personal Computers' }];
      } else if (req.query.category.toLowerCase() === 'electronics') {
        filter.$or = [{ category: 'Electronics' }];
      } else if (req.query.category.toLowerCase() === 'books') {
        filter.$or = [{ category: 'Books' }];
      } else if (req.query.category.toLowerCase() === 'toys') {
        filter.$or = [{ category: 'Toys' }];
      } else if (req.query.category.toLowerCase() === 'all products') {
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
          { price: { $regex: req.query.search } },
          { description: { $regex: req.query.search } },
          { category: { $regex: req.query.search } }
        ]
      };
    }
    console.log('filter', filter);

    try {
      results.results = await model
        .find(filter)
        .select('name description productImage userId createdAt updatedAt category count  rating price stock')
        .populate(
          'userId',
          'firstName lastName  surname email dateOfBirth gender joinedDate cart isVerified  profileImage  mobileNumber  status role  companyName   acceptTerms nationality  favoriteAnimal  address  profileImage  bio mobileNumber'
        ) // populate return merge result
        .limit(limit)
        .sort(sort)
        .skip(startIndex)
        .exec();

      // Add paginated Results to the request

      res.paginatedResults = results;
      next();
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  };
};

module.exports = paginatedResults;
