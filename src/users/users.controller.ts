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
  Put,
} from '@nestjs/common';
import { DEFAULT_PAGE_SIZE } from 'app.constants';
import { AuthRequest } from 'auth/dto/auth-request.dto';
import { AuthGuard } from 'auth/guards/auth.guard';
import { VerifyUserDto } from './dto';
import {
  SavedPhoneNumberDto,
  AddPhoneNumberDto,
  UpdateUserDto,
  UserDto,
} from './users.interfaces';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('/current')
  public async getCurrentUser(@Req() req: AuthRequest): Promise<UserDto> {
    const { user } = req;

    const userDocument = await this.usersService.findOneById(user._id);
    return UserDto.fromUserDocument(userDocument);
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

  @Put('current')
  public async updateUser(
    @Req() req: AuthRequest,
    @Body() updatedUser: UpdateUserDto,
  ): Promise<UserDto> {
    const { user } = req;

    const userDocument = await this.usersService.updateUserInfo(
      user._id,
      updatedUser,
    );

    return UserDto.fromUserDocument(userDocument);
  }

  @Delete('/current/phoneNumbers/:phoneNumberId')
  public async removeCurrentUserPhoneNumber(
    @Req() req: AuthRequest,
    @Param('phoneNumberId') phoneNumberId: string,
  ) {
    const { user } = req;
    await this.usersService.removePhoneNumber(user._id, phoneNumberId);

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
}
