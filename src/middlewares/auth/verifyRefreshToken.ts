import jwt, { VerifyErrors } from 'jsonwebtoken';

import { environmentConfig } from '@src/configs/custom-environment-variables.config';

export const verifyRefreshToken = async function (refreshToken: any): Promise<string> {
  return new Promise(function (resolve, reject) {
    jwt.verify(
      refreshToken,
      environmentConfig.REFRESH_TOKEN_SECRET_KEY as jwt.Secret,
      (err: VerifyErrors | null, payload: any) => {
        if (err) {
          return reject(err);
        }

        if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
          console.log(payload.aud);
        }

        const userId = payload.aud;
        resolve(userId);
      }
    );
  });
};

export default verifyRefreshToken;
