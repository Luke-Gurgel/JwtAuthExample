import { hash, compare } from 'bcryptjs'

export async function verifyPassword(attemptedPassword: string, actualPassword: string) {
  const passwordIsValid = await compare(attemptedPassword, actualPassword)
  if (!passwordIsValid) throw Error('Invalid password')
}

export async function hashPassword(password: string) {
  return await hash(password, 12)
}