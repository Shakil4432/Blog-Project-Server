import { model, Schema } from 'mongoose';
import { IUser, UserModel } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../config';

const userSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  let user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

userSchema.post('save', function (doc, next) {
  (doc.password = ''), next();
});

userSchema.statics.isUserExist = async function (email: string) {
  return await User.findOne({ email });
};
userSchema.statics.isUserBlocked = async function (email: string) {
  return await User.findOne({ email, isBlocked: true });
};

userSchema.statics.isPasswordMatched = async function (
  plainPassword,
  hashPassword,
) {
  return await bcrypt.compare(plainPassword, hashPassword);
};
export const User = model<IUser, UserModel>('Users', userSchema);