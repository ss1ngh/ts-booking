import { Router } from "express"
import { handleCreateUser, handleGetUser } from "src/controllers/user.controller";

const userRouter = Router();

userRouter.get('/:userId', handleGetUser);
userRouter.post('/', handleCreateUser);

export default userRouter;