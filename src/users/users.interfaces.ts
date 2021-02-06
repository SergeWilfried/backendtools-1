import { IsEmail, IsOptional, IsIn } from 'class-validator';

import { PhoneNumber } from 'users/model/users.document';
import { UserDocument } from './model';

const countries = [
  'Benin',
  'Burkina Faso',
  'Cabo Verde',
  'Cote d’Ivoire',
  'Gambia',
  'Ghana',
  'Guinea',
  'Guinea-Bissau',
  'Liberia',
  'Mali',
  'Niger',
  'Nigeria',
  'Senegal',
  'Sierra Leone',
  'Togo',
];

export class OAuthProvider {
  google: string;
  facebook: string;
}

export class KYCInfo {
  status: string;
  identityAccessKey: string;
}

export interface SavedPhoneNumberDto {
  _id?: string;
  phoneOperator: string;
  phoneNumber: string;
}

export interface AddPhoneNumberDto {
  phoneOperator: string;
  phoneNumber: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  firstName: string;

  @IsOptional()
  lastName: string;

  @IsOptional()
  birthDate: Date;

  @IsIn(countries)
  country: string;
}

export class UserDto {
  _id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  username: string;
  birthDate: Date;
  country: string;
  oauth: OAuthProvider;
  savedPhoneNumbers: Array<PhoneNumber>;

  static fromUserDocument(userDocument: UserDocument): UserDto {
    const user = new UserDto();

    user._id = userDocument._id;
    user.email = userDocument.email;
    user.phoneNumber = userDocument.phoneNumber;
    user.firstName = userDocument.firstName;
    user.lastName = userDocument.lastName;
    user.username = userDocument.username;
    user.birthDate = userDocument.birthDate;
    user.country = userDocument.country;
    user.oauth = userDocument.oauth;
    user.savedPhoneNumbers = userDocument.savedPhoneNumbers;
    return user;
  }
}

export interface UpdateUserError {
  email?: string;
  phoneNumber?: string;
}
