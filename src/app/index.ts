import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import { user } from "./user";
import cors from "cors";

export const initServer = async (): Promise<Application> => {
    const app: Application = express();

    app.use(bodyParser.json());
    app.use(cors());

    const graphqlServer = new ApolloServer({
        typeDefs: `
            ${user.types}

            type Query {
                ${user.queries}
            }
        `,
        resolvers: {
            Query: {
                ...user.resolvers.queries
            }
        }
    });

    await graphqlServer.start();

    graphqlServer.applyMiddleware({ app });

    return app;
};
