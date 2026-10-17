import { Router } from "express";
import { userContracts } from "@ahmed109/apibridge-contracts";
import { apiBridge, UnauthorizedError } from "@ahmed109/apibridge-express";
import { userRepo } from "../data/repository";

export const authRouter: Router = Router();

authRouter.get(
  userContracts.me.path,
  apiBridge.route(userContracts.me, async ({ req }) => {
    const userId = req.headers["x-demo-user-id"];

    if (!userId || typeof userId !== "string") {
      throw new UnauthorizedError(
        "Missing authentication credentials. Please provide 'x-demo-user-id' header.",
      );
    }

    const user = userRepo.getById(userId);
    if (!user) {
      throw new UnauthorizedError(`User with ID '${userId}' not found.`);
    }

    return {
      status: 200,
      body: user,
    };
  }),
);
