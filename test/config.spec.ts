import { Config } from 'src/config';

describe('envConfig', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('parse string config value', () => {
    process.env.JWT_SECRET = '123456';
    const config = new Config();

    const expectedStringValue = process.env.JWT_SECRET;
    expect(config.get('JWT_SECRET')).toEqual(expectedStringValue);
  });

  it('parse number config value', () => {
    process.env.PORT = '3001';
    const config = new Config();

    const expectedNumberValue = parseInt(process.env.PORT);
    expect(config.get('PORT')).toEqual(expectedNumberValue);
  });
});
