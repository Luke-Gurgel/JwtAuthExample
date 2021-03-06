import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity('users')
export default class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  email: string;

  @Column('text')
  password: string;

  @Field()
  @Column('int', { default: 0 })
  tokenVersion: number;
}

export async function incrementTokenVersionForUser(user: User) {
  user.tokenVersion += 1
  await user.save()
}
