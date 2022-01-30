const User = require('../models/users.model');

// Handling Get Request to /api/v1/admin/users
exports.admin_get_all_user = (req, res) => {
  console.log("ok")
  const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;

  const responseObject = {
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

  (responseObject.users = results.map((user) => {
    return {
      _id: user._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      dateOfBirth: user?.dateOfBirth,
      gender: user?.gender,
      cart: user?.cart,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
      role: user?.role,
    };
  })),
    res.status(200).send({
      success: true,
      error: false,
      message: 'Successful Found users',
      status: 200,
      data: responseObject,
    });
};
