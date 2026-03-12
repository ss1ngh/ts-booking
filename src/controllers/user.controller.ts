import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, deleteUser, getUser, updateUser } from "../repositories/index.js";
import { createUserSchema, updateUserSchema } from "../types/index.js";
import {z} from "zod";

export const handleCreateUser = async(req: Request, res : Response, next : NextFunction) => {
    try{
        const validatedData = createUserSchema.parse(req.body);
        //db call
        const user = await createUser(validatedData);

        return res.status(StatusCodes.CREATED).json({
            success : true,
            message : "User added successfully",
            data : user,
            error : {}
        })
    } catch (error) {
        next(error);
    }
}

export const handleDeleteUser = async(req : Request, res : Response, next : NextFunction) => {
    try {
        const userId = z.coerce.number().int().positive().parse(req.params.userId);

        const user = await deleteUser(userId);

        return res.status(StatusCodes.OK).json({
            success : true,
            message : `User with id ${userId} deleted successfully`,
            data : user,
            error : {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleGetUser = async(req : Request, res : Response, next : NextFunction) => {
    try {
        const userId = z.coerce.number().int().positive().parse(req.params.userId);

        const user = await getUser(userId);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Successfully fetched user details with id ${userId}`,
            data: user,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleUpdateUser = async(req : Request, res : Response, next : NextFunction) => {
    try{
        //param validation
        const userId = z.coerce.number().int().positive().parse(req.params.userId);
        //req body validation
        const validatedData = updateUserSchema.parse(req.body);

        const updatedUser = await updateUser(userId, validatedData);

        res.status(StatusCodes.OK).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
            error: {}
        });
    } catch (error : unknown) {
        next(error);
    }
}
