
const paginatedResults = (model) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = { }
   
    if (!req.query.sortBy && req.query.OrderBy) {
      sort[req.query.sortBy] = req.query.OrderBy.toLowerCase() === 'desc' ? -1 : 1;
    } else {
      sort. createdAt = -1  
    }
    

 
    //  const query = {
    //   $or: [{ firstName: "Saddam" }, { role: "user" }]
    // };
    

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {
      currentPage: {
        page: page,
        limit: limit,
      },
    };

    const totalCount = await model.countDocuments().exec();

    results.totalDocs = totalCount;
    if (endIndex < totalCount) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    results.totalPages = Math.ceil(totalCount / limit);
    results.lastPage = Math.ceil(totalCount / limit);


   

  
   


    try {
      results.results = await model
        .find(query)
        .select(' firstName lastName email dateOfBirth gender cart createdAt updatedAt 	role')
        .limit(limit)
        .sort({ addedDate: -1 })
        .skip(startIndex)
        .exec();

      // Add paginated Results to the request
      res.paginatedResults = results;
      next();
    } catch (error) {
     next(error);
    }
  };
};

module.exports = paginatedResults;
