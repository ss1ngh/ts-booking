import { Router } from "express"
import { handleCreateUser, handleDeleteUser, handleGetUser, handleUpdateUser } from "../../controllers/index.js";

const userRouter = Router();

userRouter.get('/:userId', handleGetUser);
userRouter.post('/', handleCreateUser);
userRouter.delete('/:userId', handleDeleteUser);
userRouter.patch('/:userId', handleUpdateUser);

export { userRouter };