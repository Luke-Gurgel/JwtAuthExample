import { sign, verify } from 'jsonwebtoken'
import { Response, Request } from 'express'
import User, { incrementTokenVersionForUser } from '../entity/User'

export function createAccessToken({ id, tokenVersion }: User) {
  return sign({ tokenVersion, userId: id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '5m' })
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

    await incrementTokenVersionForUser(user)
    const newAccessToken = createAccessToken(user)
    const newRefreshToken = createRefreshToken(user)
    setRefreshTokenCookie(res, newRefreshToken)
    return res.send({ ok: true, accessToken: newAccessToken })
  } catch (err) {
    console.log(err);
    return res.send({ ok: false, accessToken: '' })
  }
}