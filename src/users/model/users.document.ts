import { Prop, Schema } from '@nestjs/mongoose';

import BaseDocument from 'base/base.document';
import { KYCInfo, OAuthProvider } from '../users.interfaces';
import { Document } from 'mongoose';

@Schema()
export class PhoneNumber extends Document {
  @Prop()
  phoneNumber: string;

  @Prop()
  phoneOperator: string;
}

@Schema()
export class DebitCard extends Document {
  @Prop()
  cardHolder: string;

  @Prop()
  cardNumber: string;

  @Prop()
  cardCVC: string;

  @Prop()
  cardExpirationDate: string;

  @Prop()
  cardBrand: string;
}

@Schema({ timestamps: true })
export class User extends BaseDocument {
  @Prop({
    unique: true,
    required: true,
    trim: true,
  })
  email: string;

  @Prop({
    unique: true,
    required: true,
    trim: true,
  })
  username: string;

  @Prop({
    trim: true,
  })
  firstName: string;

  @Prop({
    trim: true,
  })
  lastName: string;

  @Prop()
  birthDate: Date;

  @Prop()
  country: string;

  @Prop()
  account: string;

  @Prop({
    trim: true,
  })
  phoneNumber: string;

  @Prop()
  password: string;

  @Prop()
  oauth: OAuthProvider;

  @Prop()
  savedPhoneNumbers: Array<PhoneNumber>;

  @Prop()
  kyc: KYCInfo;

  @Prop()
  savedDebitCards: Array<DebitCard>;
}
