import { Router } from "express"
import { handleCreateUser, handleDeleteUser, handleGetUser, handleUpdateUser } from "src/controllers/user.controller";

const userRouter = Router();

userRouter.get('/:userId', handleGetUser);
userRouter.post('/', handleCreateUser);
userRouter.delete('/:userId', handleDeleteUser);
userRouter.patch('/:userId', handleUpdateUser);

export default userRouter;