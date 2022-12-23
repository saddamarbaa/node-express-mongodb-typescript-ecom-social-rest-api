import { Schema } from 'mongoose';

export interface IToken {
  emailVerificationExpiresToken?: string;
  emailVerificationToken?: string;
  resetPasswordExpires?: string;
  resetPasswordToken?: string;
  userId: Schema.Types.ObjectId;
  accessToken?: string;
  refreshToken?: string;
}
