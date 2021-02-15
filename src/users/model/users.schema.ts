import { SchemaFactory } from '@nestjs/mongoose';

import { User, PhoneNumber, DebitCard } from './users.document';

export const UsersSchema = SchemaFactory.createForClass(User);
export const PhoneNumberSchema = SchemaFactory.createForClass(PhoneNumber);
export const DebitCardSchema = SchemaFactory.createForClass(DebitCard);

UsersSchema.methods.toJSON = function () {
  return {
    ...this.toObject(),
    password: undefined,
  };
};
