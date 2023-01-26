import crypto from 'crypto';

export const generateSecretKey = (num = 32) => {
  return crypto.randomBytes(num).toString('hex');
};
// export const key1 = crypto.randomBytes(32).toString('hex');
// export const key2 = crypto.randomBytes(32).toString('hex');
// console.table({ key1, key2 });
