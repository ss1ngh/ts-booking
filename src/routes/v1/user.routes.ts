import { Router } from "express";
import {
  handleCreateUser,
  handleDeleteUser,
  handleGetUser,
  handleUpdateUser,
} from "../../controllers/index.js";
import {
  aggressiveLimiter,
  normalLimiter,
} from "../../utils/rateLimit/rateLimit.helper.js";

const userRouter = Router();

userRouter.get("/:userId", normalLimiter, handleGetUser);

userRouter.post("/", aggressiveLimiter, handleCreateUser);
userRouter.patch("/:userId", aggressiveLimiter, handleUpdateUser);
userRouter.delete("/:userId", aggressiveLimiter, handleDeleteUser);

export { userRouter };
