//will no longer need to define how to define routing and parsing of incoming requests which is used in REACT since we are shifting gears into Apollo which requires the following
const express = require('express');

const path = require('path');
const db = require('./config/connection');
//bringing in the proper objects to start off the transition from REST to Apollo
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');



const app = express();
const PORT = process.env.PORT || 3001;

//creating an instance of the apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

//routing is handled thorugh graphQL resolvers

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // integrate the Apollo server with the Express application as middleware
  server.applyMiddleware({ app });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Call the async function to start the server
startApolloServer(typeDefs, resolvers);