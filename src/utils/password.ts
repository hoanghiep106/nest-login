import * as bcrypt from 'bcryptjs';

export const hashPassword = (
  plainPassword: string,
  saltRounds: number,
): Promise<string> => {
  return bcrypt.hash(plainPassword, saltRounds);
};

export const checkPassword = async (
  plainPassword,
  hashedPassword,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
