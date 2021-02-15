import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DEFAULT_PAGE_SIZE } from 'app.constants';
import { AuthRequest } from 'auth/dto/auth-request.dto';
import { AuthGuard } from 'auth/guards/auth.guard';
import { VerifyUserDto } from './dto';
import {
  SavedPhoneNumberDto,
  AddPhoneNumberDto,
  SavedDebitCardDto,
  AddDebitCardDto,
} from './users.interfaces';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('/current')
  public getCurrentUser(@Req() req: AuthRequest) {
    const { user } = req;

    return this.usersService.findOneById(user._id);
  }

  @Get('current/balance')
  public getCurrentUserBalance(@Req() req: AuthRequest) {
    const { user } = req;

    return this.usersService.getBalance(user.account);
  }

  @Get('/current/transactions')
  public getCurrentUserTransactionsList(
    @Req() req: AuthRequest,
    @Query() params,
  ) {
    const { user } = req;
    const { skip = 0 } = params;

    const page = Math.floor(skip / DEFAULT_PAGE_SIZE) + 1;

    return this.usersService.getTransactions(user._id, page);
  }

  @Get('/current/transactions/totals')
  public getCurrentUserTotals(@Req() req: AuthRequest, @Query() params) {
    const { user } = req;

    return this.usersService.getTransactionsTotal(user._id, params);
  }

  @Get('/current/phonenumbers')
  public getCurrentUserPhoneNumbers(
    @Req() req: AuthRequest,
  ): Promise<SavedPhoneNumberDto[]> {
    const { user } = req;

    return this.usersService.getPhoneNumbers(user._id);
  }

  @Post('/current/phonenumbers')
  public addCurrentUserPhoneNumbers(
    @Req() req: AuthRequest,
    @Body() { phoneNumber, phoneOperator }: AddPhoneNumberDto,
  ): Promise<SavedPhoneNumberDto> {
    const { user } = req;

    return this.usersService.addPhoneNumber(
      user._id,
      phoneNumber,
      phoneOperator,
    );
  }

  @Delete('/current/phoneNumbers/:phoneNumberId')
  public removeCurrentUserPhoneNumber(
    @Req() req: AuthRequest,
    @Param('phoneNumberId') phoneNumberId: string,
  ) {
    const { user } = req;
    this.usersService.removePhoneNumber(user._id, phoneNumberId);

    return {};
  }

  @Post('/current/verify')
  public verifyUserData(
    @Req() req: AuthRequest,
    @Body() verifyUserData: VerifyUserDto,
  ) {
    const { user } = req;
    return this.usersService.verifyUser(user._id, verifyUserData);
  }

  @Get('/:userId')
  getUserById(@Param('userId') userId: string) {
    return this.usersService.getUserData(userId);
  }

  @Get('/current/debitCards')
  public getCurrentUserDebitCards(
    @Req() req: AuthRequest,
  ): Promise<SavedDebitCardDto[]> {
    const { user } = req;

    return this.usersService.getDebitCards(user._id);
  }

  @Get('/current/debitCards/:debitCardId')
  public getCurrentUserDebitCard(
    @Req() req: AuthRequest,
    @Param('debitCardId') debitCardId: string,
  ): Promise<SavedDebitCardDto> {
    const { user } = req;

    return this.usersService.getDebitCardById(user._id, debitCardId);
  }

  @Delete('/current/debitCards/:debitCardId')
  public removeCurrentUserDebitCard(
    @Req() req: AuthRequest,
    @Param('debitCardId') debitCardId: string,
  ) {
    const { user } = req;
    this.usersService.removeDebitCard(user._id, debitCardId);

    return {};
  }

  @Post('/current/debitCards')
  public addCurrentUserDebitCard(
    @Req() req: AuthRequest,
    @Body()
    {
      cardHolder,
      cardNumber,
      cardCVC,
      cardExpirationDate,
      cardBrand,
    }: AddDebitCardDto,
  ): Promise<SavedDebitCardDto> {
    const { user } = req;

    return this.usersService.addDebitCard(user._id, {
      cardHolder,
      cardNumber,
      cardCVC,
      cardExpirationDate,
      cardBrand,
    });
  }
}
