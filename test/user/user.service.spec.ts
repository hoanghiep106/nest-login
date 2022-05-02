import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import * as passwordUtils from 'src/utils/password';

export type MockModelType = {
  save: jest.Mock<any, any>;
};

const mockModelInstance = {
  save: jest.fn(),
};

export const mockModel = jest.fn(() => mockModelInstance);

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

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(mockUserModel).toBeDefined();
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
});
