import { Router } from "express"

const userRouter = Router();

userRouter.get('/', getUser);
userRouter.post('/', createUser);

export default userRouter;