import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import BaseService from 'base/base.service';
import RehiveService from 'rehive/rehive.service';

import { UserDocument, PhoneNumberDocument } from './model';
import { SavedPhoneNumberDto } from './users.interfaces';

import { compareTextWithHash, getHash } from 'helpers/security.util';

import { RehiveTransactionsFilterOptions } from 'rehive/rehive.interfaces';
import { TransactionsService } from 'transactions/transactions.service';

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

  private async checkSavedPhoneNumberExistence(query): Promise<boolean> {
    return this.exists({
      savedPhoneNumbers: {
        $elemMatch: query,
      },
    });
  }

  async addPhoneNumber(
    userId: string,
    phoneNumber: string,
    phoneOperator: string,
  ): Promise<SavedPhoneNumberDto> {
    const isSavedPhoneNumberExists = await this.checkSavedPhoneNumberExistence({
      phoneNumber,
    });

    if (isSavedPhoneNumberExists) {
      throw new HttpException(
        { phoneNumber: 'This phonenumber is already added' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { savedPhoneNumbers: phones } = await this.findOneById(userId);
    if (phones.length >= 3) {
      throw new HttpException(
        { phoneNumber: 'You can`t add more then 3 phonenumbers' },
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

  async removePhoneNumber(
    userId: string,
    phoneNumberId: string,
  ): Promise<void> {
    const result = await this.updateOne(
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
    if (result.n === 0) {
      throw new HttpException(
        { phoneNumber: 'This phonenumber does`t exist' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserData(userId: string) {
    const userData = await this.findOneById(userId);
    if (!userData) {
      throw new HttpException({ user: 'Not Found' }, HttpStatus.BAD_REQUEST);
    }
    return userData;
  }

  public async resetPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findOne({ _id: userId });

    const isCorrectPassword = await compareTextWithHash(
      currentPassword,
      user.password,
    );

    if (!isCorrectPassword) {
      throw new HttpException(
        { currentPassword: 'Current password is not correct' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashNewPassword = await getHash(newPassword);
    await this.updateOne({ _id: userId }, { password: hashNewPassword });
  }
}
