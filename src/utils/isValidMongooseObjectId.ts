import { Types } from 'mongoose';

export const isValidMongooseObjectId = (id: string): boolean => {
  if (Types.ObjectId.isValid(id)) {
    if (String(new Types.ObjectId(id)) === id) return true;
    return false;
  }
  return false;
};

export default isValidMongooseObjectId;
