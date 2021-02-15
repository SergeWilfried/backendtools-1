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

export interface SavedDebitCardDto {
  _id?: string;
  cardHolder: string;
  cardNumber: string;
  cardCVC: string;
  cardExpirationDate: string;
  cardBrand: string;
}

export interface AddDebitCardDto {
  cardHolder: string;
  cardNumber: string;
  cardCVC: string;
  cardExpirationDate: string;
  cardBrand: string;
}
