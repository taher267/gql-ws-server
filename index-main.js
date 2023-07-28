import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import resolvers from "./resolvers.js";
import typeDefs from "./typeDefs.js";
import { makeExecutableSchema } from "@graphql-tools/schema";
import {
    constraintDirective,
    constraintDirectiveTypeDefs,
} from "graphql-constraint-directive";
import respErrsKeyValues from "./helper/respErrsKeyValues.js";

let schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers,

});
schema = constraintDirective()(schema);


// Hand in the schema we just created and have the
// WebSocketServer start listening.
const server = new ApolloServer({
    schema,
    plugins: [
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
    ],

});
(async () => {
    const { url } = await startStandaloneServer(server);
    console.log(`🚀 Server ready at ${url}`);
})();

// const { url } = await startStandaloneServer(server, {
//     context: () => { },
//     // listen: {
//     //     port: process.env.PORT || 4000
//     // }
// });
// console.log(`🚀 Server ready at ${url}`);