import * as bcrypt from 'bcrypt';

export const getHash = async (text) => await bcrypt.hash(text, 10);

export const compareTextWithHash = async (text, hash) => {
  await bcrypt.compare(text, hash);
};