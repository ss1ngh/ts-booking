import { Router } from "express";
import movieRouter from "./v1/movies.routes.js";
import userRouter from './v1/user.routes.js';

const v1 = Router();

v1.use('/movies', movieRouter);
v1.use('/movies', userRouter);