import User from '../entity/User'
import { Context, LoginResponse } from '../types'
import { authMiddleware } from '../middleware/auth'
import { verifyPassword, hashPassword } from '../services/password'
import {
  createAccessToken,
  createRefreshToken,
  setRefreshTokenCookie,
  incrementTokenVersionForUser
} from '../services/jwt'
import {
  Ctx,
  Arg,
  Query,
  Resolver,
  Mutation,
  UseMiddleware
} from 'type-graphql'

@Resolver()
export class UserResolver {
  @Query(() => [ User ])
  async users(): Promise<User[]> {
    return await User.find()
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(authMiddleware)
  async me(@Ctx() { auth }: Context ): Promise<User | null> {
     try {
      const user = await User.findOne({ where: { id: auth?.userId } })
      if (!user) throw Error('User not found')
      return user
    } catch (err) {
      console.log('email update error >>>', err);
      return null
    }
  }

  @Mutation(() => Boolean)
  async signup(
    @Arg('email') email: string,
    @Arg('password') password: string,
  ): Promise<boolean> {
    try {
      const user = await User.findOne({ where: { email } })
      if (user) throw Error('User already exists')

      const hashedPassword = await hashPassword(password)
      await User.insert({ email, password: hashedPassword })
      return true
    } catch (error) {
      console.log(error);
      return false
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: Context
  ): Promise<LoginResponse> {
    try {
      const user = await User.findOne({ where: { email } })
      if (!user) throw Error('User not found')
      await verifyPassword(password, user.password)

      user.tokenVersion += 1
      const accessToken = createAccessToken(user)
      const refreshToken = createRefreshToken(user)
      setRefreshTokenCookie(res, refreshToken)
      await incrementTokenVersionForUser(user)

      return { accessToken, user }
    } catch (err) {
      return { error: err.message }
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(authMiddleware)
  async logout(@Ctx() { res }: Context ): Promise<Boolean> {
    res.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME!)
    return true
  }


  @Mutation(() => Boolean)
  @UseMiddleware(authMiddleware)
  async updateEmail(
    @Arg('newEmail') newEmail: string,
    @Ctx() { auth }: Context,
  ): Promise<Boolean> {
    try {
      const user = await User.findOne({ where: { id: auth?.userId } })
      if (!user) throw Error('User not found')
      user.email = newEmail
      await user.save()
      return true
    } catch (err) {
      console.log('email update error >>>', err);
      return false
    }
  }
}
