import type { Request, Response, NextFunction } from "express";
import { addSeat, deleteSeat, getAllSeats, getSeatById, updateSeat } from "../repositories/index.js";
import { createSeatSchema, updateSeatSchema, paginationSchema } from "../types/index.js";
import { StatusCodes } from "http-status-codes";
import {z} from "zod";

export const handleAddSeat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = createSeatSchema.parse(req.body);
        const seat = await addSeat(validatedData);

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Seat added successfully",
            data: seat,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleDeleteSeat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        await deleteSeat(id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully deleted seat",
            error: {},
            data: { id },
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetSeatById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const seat = await getSeatById(id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Successfully fetched Seat`,
            data: seat,
            error: {}
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetAllSeats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {skip, take} = paginationSchema.parse(req.query);
        const seats = await getAllSeats({ skip, take });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully fetched all Seats",
            data: seats,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleUpdateSeat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const validatedData = updateSeatSchema.parse(req.body);
        
        const updatedSeat = await updateSeat(id, validatedData);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully updated seat",
            data: updatedSeat,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}
