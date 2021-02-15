import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from 'auth/auth.module';
import { RehiveModule } from 'rehive/rehive.module';
import { TransactionsModule } from 'transactions/transactions.module';

import { User, PhoneNumber, DebitCard } from './model/users.document';
import {
  UsersSchema,
  PhoneNumberSchema,
  DebitCardSchema,
} from './model/users.schema';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
    MongooseModule.forFeature([
      { name: PhoneNumber.name, schema: PhoneNumberSchema },
    ]),
    MongooseModule.forFeature([
      { name: DebitCard.name, schema: DebitCardSchema },
    ]),
    forwardRef(() => AuthModule),
    RehiveModule,
    TransactionsModule,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
