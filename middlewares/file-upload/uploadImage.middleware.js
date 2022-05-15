const multer = require('multer');

const getImageExtension = require('../../utils/getImageExtension');

// Set Storage Engine
// Configuring and validating the upload
const storage = multer.diskStorage({
  destination: (req, file, callbackFunction) => {
    const { isUserImg } = req.body;

    if (file?.fieldname === 'profileImage') {
      callbackFunction(null, 'public/uploads/users');
    } else {
      callbackFunction(null, 'public/uploads');
    }
  },

  // By default, multer removes file extensions so let's add them back
  filename: (req, file, callbackFunction) => {
    callbackFunction(null, `${file.fieldname}-${Date.now()}${getImageExtension(file.mimetype)}`);
  }
});

// Initialize upload variable
exports.uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // accept files up 10 mgb
  }
});
