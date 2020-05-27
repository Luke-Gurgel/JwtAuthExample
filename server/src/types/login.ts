import { ObjectType, Field } from "type-graphql"
import User from '../entity/User'

@ObjectType()
export class LoginResponse {
  @Field({ nullable: true })
  accessToken?: string

  @Field(() => User, { nullable: true })
  user?: User

  @Field({ nullable: true })
  error?: string
}
