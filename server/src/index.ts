import "reflect-metadata";
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { buildSchema } from 'type-graphql'
import { createConnection } from "typeorm";
import { getNewJwtPair } from "./services/jwt";
import { ApolloServer } from 'apollo-server-express'
import { UserResolver } from "./resolvers/userResolver";

(async () => {
  const app = express()
  app.use(cookieParser())
  app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
    credentials: true,
  }))

  app.get('/', (_, res) => res.send('Hello'))
  app.post('/refresh_token', getNewJwtPair)

  await createConnection()

  const apolloServer = new ApolloServer({
    schema: await buildSchema({ resolvers: [UserResolver] }),
    context: ({ req, res }) => ({ req, res })
  })

  apolloServer.applyMiddleware({ app, cors: false })

  app.listen(4000, () => {
    console.log('express server listening on port 4000');
  })
})()
