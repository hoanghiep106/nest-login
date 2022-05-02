import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import * as passwordUtils from 'src/utils/password';
import { mockModel, mockModelInstance, MockModelType } from 'test/utils';

describe('UserService', () => {
  let userService: UserService;
  let mockUserModel: MockModelType;

  const mockUsername = 'hiep';
  const mockPlainPassword = 'ah56XGG@*Lp^wgAr';
  const mockHashedPassword =
    '$2b$10$cjI.PiVqLrVfkWPWhNibseEwAH3ZCPMmtcIdQJodNOrW/Ha1A8zTS';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    mockUserModel = module.get(getModelToken(User.name));
  });

  it('user should be saved with hashed password', async () => {
    jest
      .spyOn(passwordUtils, 'hashPassword')
      .mockReturnValueOnce(Promise.resolve(mockHashedPassword));

    await userService.create({ username: mockUsername }, mockPlainPassword);

    expect(mockUserModel).toBeCalledWith({
      username: mockUsername,
      hashedPassword: mockHashedPassword,
    });
    expect(mockModelInstance.save).toBeCalled();
  });

  it("user's credentials should be validated", async () => {
    jest
      .spyOn(passwordUtils, 'checkPassword')
      .mockReturnValueOnce(Promise.resolve(true));

    const user = new User();

    const validationResult = await userService.validate(
      user,
      mockPlainPassword,
    );

    expect(validationResult).toEqual(true);
  });
});
