import { hash, compare } from 'bcryptjs'

export async function verifyPassword(attemptedPassword: string, actualPassword: string) {
  const passwordIsValid = await compare(attemptedPassword, actualPassword)
  if (!passwordIsValid) throw Error('Invalid password')
}

export function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}