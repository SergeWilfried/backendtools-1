export class OAuthProvider {
  google: string;
  facebook: string;
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

export interface ResetPasswordDto {
  currentPassword: string;
  newPassword: string;
}
