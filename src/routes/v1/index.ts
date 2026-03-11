import { Router } from "express";
import movieRouter from "./movies.routes.js";
import userRouter from './user.routes.js';

const v1 = Router();

v1.use('/movies', movieRouter);
v1.use('/users', userRouter);

export default v1;