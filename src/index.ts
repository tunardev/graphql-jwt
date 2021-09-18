import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import { Express, MyContext } from "./types";
import { AuthResolver } from "./resolvers/auth";
import { typeDefs } from "./typeDefs";
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
  const context: any = {};
  context.typeDefs = typeDefs;
  context.resolvers = [AuthResolver, HelloResolver];
  context.context = ({ req, res }: MyContext) => ({ req, res });

  const apolloServer = new ApolloServer(context);

  await createConnection();

  const app: Express = express();

  app.use(cookieParser());

  app.use((req, _, next) => {
    const accessToken = req.cookies["access-token"];
    try {
      const data = verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as any;
      (req as any).userId = data.userId;
    } catch {}
    next();
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  const port = process.env.PORT || 8000;
  app.listen(port);
};

require("dotenv").config();
main().catch(console.error);
