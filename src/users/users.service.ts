import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import BaseService from 'base/base.service';
import RehiveService from 'rehive/rehive.service';

import { UserDocument, PhoneNumberDocument } from './model';
import {
  SavedPhoneNumberDto,
  UpdateUserDto,
  UpdateUserError,
} from './users.interfaces';

import { RehiveTransactionsFilterOptions } from 'rehive/rehive.interfaces';
import { TransactionsService } from 'transactions/transactions.service';
import { VerifyUserDto } from './dto';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(
    @InjectModel(UserDocument.name)
    model: Model<UserDocument>,
    @InjectModel(PhoneNumberDocument.name)
    private readonly phoneNumberModel: Model<PhoneNumberDocument>,
    private readonly rehiveService: RehiveService,
    private transactionsService: TransactionsService,
  ) {
    super(model);
  }

  async getBalance(accountReference: string, currency?: string) {
    try {
      const balance = await this.rehiveService.getBalance(
        accountReference,
        currency,
      );

      return balance;
    } catch (e) {
      throw new HttpException(e.response.data, HttpStatus.BAD_REQUEST);
    }
  }

  async getTransactions(userId: string, page?: number) {
    const {
      transactions,
      count,
    } = await this.transactionsService.getUserTransactions(userId, page);
    const partnerIds = transactions
      .filter(({ partnerId }) => partnerId !== null)
      .map(({ partnerId }) => partnerId);

    const partners = await this.model.find({
      _id: { $in: [...new Set(partnerIds)] },
    });

    return {
      count,
      transactions: transactions.map((item) => ({
        ...item,
        partner: partners.find(({ _id }) => _id === item.partnerId) || null,
      })),
    };
  }

  getTransactionsTotal(
    userId: string,
    params: Partial<RehiveTransactionsFilterOptions>,
  ) {
    return this.transactionsService.getUserTransactionTotal(userId, {
      currency: 'XOF',
      ...params,
    });
  }

  async getPhoneNumbers(userId: string): Promise<SavedPhoneNumberDto[]> {
    const user = await this.findOneById(userId);
    return user.savedPhoneNumbers;
  }

  private async checkSavedPhoneNumberExistence(
    userId: string,
    query: FilterQuery<PhoneNumberDocument>,
  ): Promise<boolean> {
    return this.exists({
      $and: [
        { _id: userId },
        {
          savedPhoneNumbers: {
            $elemMatch: query,
          },
        },
      ],
    });
  }

  async addPhoneNumber(
    userId: string,
    phoneNumber: string,
    phoneOperator: string,
  ): Promise<SavedPhoneNumberDto> {
    const isSavedPhoneNumberExists = await this.checkSavedPhoneNumberExistence(
      userId,
      { phoneNumber },
    );

    if (isSavedPhoneNumberExists) {
      throw new HttpException(
        { phoneNumber: 'This phone number is already added' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { savedPhoneNumbers: phones } = await this.findOneById(userId);
    if (phones.length >= 3) {
      throw new HttpException(
        { phoneNumber: 'You can`t add more then 3 phone numbers' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newPhoneNumber = new this.phoneNumberModel({
      phoneNumber,
      phoneOperator,
    });

    const { savedPhoneNumbers } = await this.findOneAndUpdate(
      { _id: userId },
      { $push: { savedPhoneNumbers: newPhoneNumber } },
      { new: true },
    );

    return savedPhoneNumbers[savedPhoneNumbers.length - 1];
  }

  async checkExistence(
    userId: string,
    query: FilterQuery<UserDocument>,
  ): Promise<boolean> {
    return this.exists({
      $and: [{ _id: { $ne: userId } }, query],
    });
  }

  async updateUserInfo(
    userId: string,
    updatedUser: UpdateUserDto,
  ): Promise<UserDocument> {
    const errors: UpdateUserError = {};
    const [isEmailExist, isPhoneExists] = await Promise.all([
      this.checkExistence(userId, {
        email: updatedUser.email,
      }),
      this.checkExistence(userId, {
        phoneNumber: updatedUser.phoneNumber,
      }),
    ]);

    if (isEmailExist)
      errors.email = 'User with this email is already registered';

    if (isPhoneExists)
      errors.phoneNumber = 'User with this phone number is already registered';

    if (isEmailExist || isPhoneExists) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    return this.updateOne({ _id: userId }, updatedUser);
  }

  async removePhoneNumber(
    userId: string,
    phoneNumberId: string,
  ): Promise<void> {
    const isPhoneNumberExists = await this.checkSavedPhoneNumberExistence(
      userId,
      { _id: new Types.ObjectId(phoneNumberId) },
    );

    if (!isPhoneNumberExists) {
      throw new HttpException(
        { phoneNumber: 'This phone number does not exist' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.findOneAndUpdate(
      {
        _id: userId,
        savedPhoneNumbers: {
          $elemMatch: { _id: new Types.ObjectId(phoneNumberId) },
        },
      },
      {
        $pull: {
          savedPhoneNumbers: { _id: new Types.ObjectId(phoneNumberId) },
        },
      },
    );
  }

  async getUserData(userId: string) {
    const userData = await this.findOneById(userId);
    if (!userData) {
      throw new HttpException({ user: 'Not Found' }, HttpStatus.BAD_REQUEST);
    }
    return userData;
  }

  async verifyUser(userId: string, verificationData: VerifyUserDto) {
    const {
      identityAccessKey,
      firstName,
      lastName,
      country,
      birthDate,
    } = verificationData;

    const status = this.rehiveService.getRehiveStatus();
    const data = await this.rehiveService.updateUserKYCStatus(userId, status);

    return this.updateById(userId, {
      firstName,
      lastName,
      country,
      birthDate,
      kyc: {
        status: data.status,
        identityAccessKey,
      },
    });
  }

  async updateUserKYC(identityAccessKey: string, status: string) {
    const user = await this.model.findOne({
      'kyc.identityAccessKey': identityAccessKey,
    });

    if (!user) {
      return { success: false };
    }

    const rehiveStatus = this.rehiveService.getRehiveStatus(status);

    const data = await this.rehiveService.updateUserKYCStatus(
      user._id,
      rehiveStatus,
    );

    await this.model.updateOne(
      { _id: user._id },
      {
        $set: {
          'kyc.status': data.status,
        },
      },
    );

    return { success: true };
  }
}
