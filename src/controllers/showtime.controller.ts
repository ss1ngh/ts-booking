import type { Request, Response, NextFunction } from "express";
import { addShowtime, deleteShowtime, getAllShowtimes, getShowtimeById, updateShowtime } from "../repositories/index.js";
import { createShowtimeSchema, updateShowtimeSchema, paginationSchema } from "../types/index.js";
import { StatusCodes } from "http-status-codes";
import {z} from "zod";

export const handleAddShowtime = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = createShowtimeSchema.parse(req.body);
        const showtime = await addShowtime(validatedData);

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Showtime added successfully",
            data: showtime,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleDeleteShowtime = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        await deleteShowtime(id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully deleted showtime",
            error: {},
            data: { id },
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetShowtimeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const showtime = await getShowtimeById(id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Successfully fetched Showtime`,
            data: showtime,
            error: {}
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetAllShowtimes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {skip, take} = paginationSchema.parse(req.query);
        const showtimes = await getAllShowtimes({ skip, take });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully fetched all Showtimes",
            data: showtimes,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleUpdateShowtime = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const validatedData = updateShowtimeSchema.parse(req.body);
        
        const updatedShowtime = await updateShowtime(id, validatedData);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully updated showtime",
            data: updatedShowtime,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}
