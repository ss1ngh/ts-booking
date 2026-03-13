import type { Request, Response, NextFunction } from "express";
import { addTheater, deleteTheater, getAllTheaters, getTheaterById, updateTheater } from "../repositories/index.js";
import { createTheaterSchema, updateTheaterSchema, paginationSchema } from "../types/index.js";
import { StatusCodes } from "http-status-codes";
import {z} from "zod";

export const handleAddTheater = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = createTheaterSchema.parse(req.body);
        const theater = await addTheater(validatedData);

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Theater added successfully",
            data: theater,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleDeleteTheater = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        await deleteTheater(id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully deleted theater",
            error: {},
            data: { id },
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetTheaterById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const theater = await getTheaterById(id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Successfully fetched Theater`,
            data: theater,
            error: {}
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetAllTheaters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {skip, take} = paginationSchema.parse(req.query);
        const theaters = await getAllTheaters({ skip, take });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully fetched all Theaters",
            data: theaters,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleUpdateTheater = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const validatedData = updateTheaterSchema.parse(req.body);
        
        const updatedTheater = await updateTheater(id, validatedData);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully updated theater",
            data: updatedTheater,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}
