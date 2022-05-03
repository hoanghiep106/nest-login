import config from 'src/config';
import { ErrorMessage, UserStatus } from 'src/enums';
import * as request from 'supertest';
import { createUser, dropCollection } from 'test-e2e/database';

describe('Auth', () => {
  const client = request(config.get('BASE_API_URL'));

  const mockUsername = 'username';
  const mockPlainPassword = 'ah56XGG@*Lp^wgAr';

  const mockLoginData = {
    username: mockUsername,
    password: mockPlainPassword,
  };

  beforeAll(async () => {
    // Create a user to test
    await createUser(mockUsername, mockPlainPassword);
  });

  afterAll(async () => {
    await dropCollection('users');
  });

  it('login successfully', async () => {
    const response = await client.post('/login').send(mockLoginData);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('accessToken');
  });

  it('user not found', async () => {
    const response = await client
      .post('/login')
      .send({ username: 'not found' });
    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toEqual(ErrorMessage.INVALID_CREDENTIALS);
  });

  it('not-found username reaches rate limit (3 attempts)', async () => {
    const username = 'not-found';
    await client.post('/login').send({ username, password: 'password 1' });
    await client.post('/login').send({ username, password: 'password 2' });
    await client.post('/login').send({ username, password: 'password 3' });

    const response = await client
      .post('/login')
      .send({ username, password: 'password 4' });
    expect(response.statusCode).toEqual(403);
    expect(response.body.message).toEqual(ErrorMessage.LOCKED_USER);
  });

  it('user is locked', async () => {
    const username = 'locked';
    await createUser(username, mockPlainPassword, UserStatus.Locked);
    const response = await client.post('/login').send({
      username,
      password: mockPlainPassword,
    });
    expect(response.statusCode).toEqual(403);
    expect(response.body.message).toEqual(ErrorMessage.LOCKED_USER);
  });

  it('wrong credentials', async () => {
    const response = await client
      .post('/login')
      .send({ username: mockUsername, password: 'wrong password' });
    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toEqual(ErrorMessage.INVALID_CREDENTIALS);
  });

  it('rate limit reached (3 attempts)', async () => {
    await client
      .post('/login')
      .send({ username: mockUsername, password: 'password1' });
    await client
      .post('/login')
      .send({ username: mockUsername, password: 'password2' });
    await client
      .post('/login')
      .send({ username: mockUsername, password: 'password3' });
    const response = await client
      .post('/login')
      .send({ username: mockUsername, password: 'password4' });
    expect(response.statusCode).toEqual(403);
    expect(response.body.message).toEqual(ErrorMessage.LOCKED_USER);
  });
});
