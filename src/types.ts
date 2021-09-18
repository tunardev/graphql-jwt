import { Request, Response, Express as ExpressType } from "express";

export type MyContext = {
  req: Request & { userId: string };
  res: Response;
};

export type Express = ExpressType;
