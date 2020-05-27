import { MiddlewareFn } from "type-graphql"
import { Context } from "src/types"
import { verify } from 'jsonwebtoken'

export const authMiddleware: MiddlewareFn<Context> = ({ context }, next) => {
  try {
    const authHeader = context.req.headers['authorization']
    if (!authHeader) {
      throw Error('Missing authorization header')
    }

    const [bearer, accessToken] = authHeader.split(' ')
    if (!bearer || bearer.toLowerCase() !== 'bearer') {
      throw Error('Incorrectly formatted Authorization header')
    }

    if (!accessToken) {
      throw Error('Missing access token')
    }

    const payload = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as { userId: string }
    context.auth = payload
  } catch (err) {
    console.log(err);
    return err
  }

  return next()
}