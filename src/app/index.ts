import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import JWTService from "../services/jwt";
import { GraphqlContext } from "../intefaces";
import { User } from "../app/user";

interface MyContext {
  req: express.Request;
  res: express.Response;
}

export async function initServer() {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());

  app.get("/", (req, res) => {
    res.status(200).json({ message: "Everything is good" });
  });

  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `
            ${User.types}

            type Query {
                ${User.queries}
            }
        `,
    resolvers: {
      Query: {
        ...User.resolvers.queries
      }
    },
    context: ({ req, res }: MyContext) => {
      return {
        user: req.headers.authorization
          ? JWTService.decodeToken(req.headers.authorization.split("Bearer ")[1])
          : undefined,
      };
    },
  });

  await graphqlServer.start();
  graphqlServer.applyMiddleware({ app });

  return app;
}
