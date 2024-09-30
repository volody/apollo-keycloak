const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const Keycloak = require("keycloak-connect");
const session = require("express-session");

// Sample GraphQL schema
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Sample resolvers
const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
};

// Create Express app
const app = express();

// Session setup (required for Keycloak)
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
  })
);

// Keycloak setup
const keycloak = new Keycloak(
  {},
  {
    "auth-server-url": "http://localhost:8080/auth",
    realm: "myrealm",
    resource: "apollo-client",
    credentials: {
      secret: process.env.KEYCLOAK_CLIENT_SECRET, // Replace with actual client secret from Keycloak
    },
    "confidential-port": 0,
  }
);

// Protect Apollo Server with Keycloak middleware
app.use(keycloak.middleware());

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    return { token };
  },
});

// Apply Apollo middleware
server.start().then(() => {
  server.applyMiddleware({ app });

  // Start server
  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
});
