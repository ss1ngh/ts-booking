import type { Request, Response, NextFunction } from "express";
import { addBooking, deleteBooking, getAllBookings, getBookingById, updateBooking } from "../repositories/index.js";
import { createBookingSchema, updateBookingSchema, paginationSchema } from "../types/index.js";
import { StatusCodes } from "http-status-codes";
import {z} from "zod";

export const handleAddBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = createBookingSchema.parse(req.body);
        const booking = await addBooking(validatedData);

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Booking added successfully",
            data: booking,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleDeleteBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        await deleteBooking(id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully deleted booking",
            error: {},
            data: { id },
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetBookingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const booking = await getBookingById(id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Successfully fetched Booking`,
            data: booking,
            error: {}
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {skip, take} = paginationSchema.parse(req.query);
        const bookings = await getAllBookings({ skip, take });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully fetched all Bookings",
            data: bookings,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleUpdateBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const validatedData = updateBookingSchema.parse(req.body);
        
        const updatedBooking = await updateBooking(id, validatedData);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully updated booking",
            data: updatedBooking,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}
