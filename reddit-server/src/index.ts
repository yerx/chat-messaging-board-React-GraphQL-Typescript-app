import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

// create async main function
const main = async () => {
  // connect to the database
  const orm = await MikroORM.init(microConfig);
  // run migrations
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
      },
      secret: "ransegdomsetegring",
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    tracing: true,
    context: ({ req, res }): MyContext => ({
      em: orm.em,
      req: req as MyContext["req"],
      res,
    }),
  });

  apolloServer.applyMiddleware({ app });

  const port = 4000;
  app.listen(port, () => {
    console.log(`server started on localhost:${port}`);
  });
};

main().catch((err) => {
  console.error(err);
});
