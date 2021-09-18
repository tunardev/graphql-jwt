import { MyContext } from "../types";
import { User } from "../entity/User";
import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";

interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

interface LoginInput {
  password: string;
  email: string;
}

export const AuthResolver = {
  Query: {
    me: (_, __, { req }: MyContext) => {
      if (!req.userId) {
        return null;
      }

      return User.findOne(req.userId);
    },
  },
  Mutation: {
    register: async (
      _,
      { email, password, username }: RegisterInput,
      { res }: MyContext
    ) => {
      const hashedPassword = await argon2.hash(password);
      const user = await User.create({
        email,
        password: hashedPassword,
        username,
      });

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET as string
      );
      const accessToken = jwt.sign(
        {
          username: user.username,
          email: user.email,
          password: user.password,
          userId: user.id,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
          expiresIn: "24h",
        }
      );

      res.cookie("refresh-token", refreshToken);
      res.cookie("access-token", accessToken);

      return true;
    },
    login: async (_, { email, password }: LoginInput, { res }: MyContext) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return null;
      }

      const valid = await argon2.verify(password, user.password);
      if (!valid) {
        return null;
      }

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET as string
      );
      const accessToken = jwt.sign(
        user,
        process.env.ACCESS_TOKEN_SECRET as string,
        {
          expiresIn: "24h",
        }
      );

      res.cookie("refresh-token", refreshToken);
      res.cookie("access-token", accessToken);

      return true;
    },
    logout(_, __, { res }: MyContext): boolean {
      res.cookie("refresh-token", "");
      res.cookie("access-token", "");
      return true;
    },
  },
};
