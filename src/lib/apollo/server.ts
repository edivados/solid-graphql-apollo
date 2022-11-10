import { ApolloServer } from "@apollo/server";  
  
const schema = `
  type Query {
    hello: String
  }
`;  
  
const resolvers = {
  Query: {
    hello: () => {
      return "Hello World";
    },
  },
};  
  
export const apolloServer = new ApolloServer({
  typeDefs: schema,
  resolvers,
});  
  
apolloServer.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();