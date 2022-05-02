export type MockModelType = {
  save: jest.Mock<any, any>;
};

export const mockModelInstance = {
  save: jest.fn(),
};

export const mockModel = jest.fn(() => mockModelInstance);

export const mockJwtService = {
  sign: jest.fn(),
};
