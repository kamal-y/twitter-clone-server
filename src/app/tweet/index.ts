import { mutations } from "./mutation";
import resolvers from "./resolvers";
import { types } from "./types";
import {queries} from "./queries";

export const Tweet =  {
  types,
  resolvers,
  mutations,
  queries
};