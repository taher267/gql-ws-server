import env from "dotenv";
env.config();
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { createServer } from "http";
import express from "express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import bodyParser from "body-parser";
import cors from "cors";
import resolvers from "./resolvers.js";
import typeDefs from "./typeDefs.js";
import {
    constraintDirective,
    constraintDirectiveTypeDefs,
} from "graphql-constraint-directive";
import respErrsKeyValues from "./helper/respErrsKeyValues.js";
import db from "./db/index.js";
// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server

let schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers,
});
schema = constraintDirective()(schema);

// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = createServer(app);

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
});
// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer.
const server = new ApolloServer({
    schema,
    plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async requestDidStart() {
                return {
                    async willSendResponse(requestContext) {
                        const { response, errors } = requestContext;
                        if (errors) {
                            response.body.singleResult.errors.push(respErrsKeyValues(errors));
                        }
                        return response;
                    },
                };
            },
        },
        // Proper shutdown for the WebSocket server.
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ],
});

(async () => {
    await server.start();

    app.use("/", cors({
        origin: "*"
    }), bodyParser.json(), expressMiddleware(server));
    const PORT = process.env.PORT || 4000;
    db()
        .then(() => {
            httpServer.listen(PORT, () => {
                console.log(`Server is now running on http://localhost:${PORT}`); //graphql
            });
        })
        .catch(() => {
            process.exit(1);
        });
})();
