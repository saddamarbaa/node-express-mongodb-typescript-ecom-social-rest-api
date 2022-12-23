import fs from 'fs';

export const deleteFile = (filePath: fs.PathLike) => {
  fs.stat(filePath, function (err, stats) {
    console.log(stats); // here we got all information of file in stats variable
    if (err) {
      console.log('fail to find file path', err);
      // throw new Error('fail to find file path');
    } else {
      fs.unlink(filePath, function (error) {
        if (error) {
          console.log('fail to delete the file', error);
          // throw error;
        }
        console.log('successfully deleted file ');
      });
    }
  });
};
