import { AuthResolver } from "./auth";
import { HelloResolver } from "./hello";

export const resolvers = {
  Query: {
    ...AuthResolver.Query,
    ...HelloResolver.Query,
  },
  Mutation: {
    ...AuthResolver.Mutation,
  },
};
