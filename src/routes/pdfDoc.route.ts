import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs, { createReadStream } from 'fs';
import createHttpError from 'http-errors';

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pdfName = `sample.pdf`;
    const folderFullPath = path.resolve(process.cwd(), `${process.env.PWD}/public/pdf/${pdfName}`);

    fs.stat(folderFullPath, async function (err, stats) {
      if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
        console.log(stats); // here we got all information of file in stats variable
      }

      if (err && process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
        console.log('fail to find file path', err);
        return next(createHttpError(`Fail to find file path`));
      }

      // const result = await fsPromises.readFile(folderFullPath);
      const stream = await createReadStream(folderFullPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${pdfName}`);
      stream.pipe(res);
    });
  } catch (error) {
    return next(error);
  }
});

export = router;
