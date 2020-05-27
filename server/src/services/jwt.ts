import User from '../entity/User'
import { getConnection } from 'typeorm'
import { Response, Request } from 'express'
import { sign, verify } from 'jsonwebtoken'

export function createAccessToken({ id, tokenVersion }: User) {
  return sign({ tokenVersion, userId: id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15s' })
}

export function createRefreshToken({ id, tokenVersion }: User) {
  return sign({ tokenVersion, userId: id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' })
}

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie(
    process.env.REFRESH_TOKEN_COOKIE_NAME!,
    refreshToken,
    { httpOnly: true, path: '/refresh_token' }
  )
}

export async function incrementTokenVersionForUser({ id }: User) {
  await getConnection().getRepository(User).increment({ id }, 'tokenVersion', 1)
}

export async function getNewJwtPair(req: Request, res: Response) {
  const refreshToken = req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME!]
  if (!refreshToken) {
    return res.send({ ok: false, accessToken: '' })
  }

  try {
    const verificationPayload: any = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!)
    const user = await User.findOne({ id: verificationPayload.userId })

    if (!user) {
      throw Error('User not found')
    } else if (user.tokenVersion !== verificationPayload.tokenVersion) {
      throw Error('Refresh token version is invalid')
    }

    user.tokenVersion += 1
    const newAccessToken = createAccessToken(user)
    const newRefreshToken = createRefreshToken(user)
    setRefreshTokenCookie(res, newRefreshToken)
    await incrementTokenVersionForUser(user)
    return res.send({ ok: true, accessToken: newAccessToken })
  } catch (err) {
    console.log(err);
    return res.send({ ok: false, accessToken: '' })
  }
}