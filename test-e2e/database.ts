import { MongoClient } from 'mongodb';
import config from 'src/config';
import { UserStatus } from 'src/enums';
import { hashPassword } from 'src/utils/password';

const getClient = (): Promise<MongoClient> => {
  return MongoClient.connect(config.get('TEST_DATABASE_URL'));
};

export const createUser = async (
  username: string,
  password: string,
  status: UserStatus = UserStatus.Active,
) => {
  const hashedPassword = await hashPassword(password, 10);
  const user = {
    username,
    hashedPassword,
    status,
  };
  const client = await getClient();
  const db = client.db(config.get('TEST_DATABASE_NAME'));
  await db.collection('users').insertOne(user);
  await client.close();
};

export const dropCollection = async (name: string) => {
  const client = await getClient();
  const db = client.db(config.get('TEST_DATABASE_NAME'));
  await db.collection(name).drop();
  await client.close();
};
