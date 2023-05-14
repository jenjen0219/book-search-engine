const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');

//bringing in the proper objects to start off the transition from REST to Apollo
const {ApolloServer} = require('apollo-server-express');
const {typeDefs, resolvers} = require('./schemas');
const {authMiddleware} = require('./utils/auth');

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



app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
