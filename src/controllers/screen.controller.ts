import type { Request, Response, NextFunction } from "express";
import { addScreen, deleteScreen, getAllScreens, getScreenById, updateScreen } from "../repositories/index.js";
import { createScreenSchema, updateScreenSchema, paginationSchema } from "../types/index.js";
import { StatusCodes } from "http-status-codes";
import {z} from "zod";

export const handleAddScreen = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = createScreenSchema.parse(req.body);
        const screen = await addScreen(validatedData);

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Screen added successfully",
            data: screen,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleDeleteScreen = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        await deleteScreen(id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully deleted screen",
            error: {},
            data: { id },
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetScreenById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const screen = await getScreenById(id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Successfully fetched Screen`,
            data: screen,
            error: {}
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetAllScreens = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {skip, take} = paginationSchema.parse(req.query);
        const screens = await getAllScreens({ skip, take });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully fetched all Screens",
            data: screens,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleUpdateScreen = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const validatedData = updateScreenSchema.parse(req.body);
        
        const updatedScreen = await updateScreen(id, validatedData);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully updated screen",
            data: updatedScreen,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}
