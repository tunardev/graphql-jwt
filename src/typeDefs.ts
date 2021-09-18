import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
  }
  type Query {
    me: User
    hello: String!
  }
  type Mutation {
    register(email: String!, password: String!, username: String!): Boolean!
    logout: Boolean!
    login(email: String!, password: String!): Boolean
  }
`;
