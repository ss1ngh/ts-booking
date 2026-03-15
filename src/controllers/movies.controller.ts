import type { Request, Response, NextFunction } from "express";
import { addMovie, deleteMovie, getAllMovies, getMovieById, getMoviesWithShowtimes, updateMovie } from "../repositories/index.js";
import { createMovieSchema, updateMovieSchema, paginationSchema } from "../types/index.js";
import { StatusCodes } from "http-status-codes";
import {z} from "zod";
import { NotFoundError } from "../utils/errors/AppError.js";


export const handleAddMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //validate input
        const validatedData = createMovieSchema.parse(req.body);
        //db call
        const movie = await addMovie(validatedData);

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Movie added successfully",
            data: movie,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleDeleteMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const movieId = z.uuid().parse(req.params.movieId);
        //db call
        await deleteMovie(movieId);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully deleted movie",
            error: {},
            data: { movieId },
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetMovieById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const movieId = z.uuid().parse(req.params.movieId);

        const movie = await getMovieById(movieId);

        if (!movie) {
            throw new NotFoundError("Movie")
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Successfully fetched Movie with id : ${movieId}`,
            data: movie,
            error: {}
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetAllMovies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {skip, take} = paginationSchema.parse(req.query);
        const movies = await getAllMovies({ skip, take });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully fetched all Movies",
            data: movies,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleGetMovieWithShowtimes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const movieId = z.uuid().parse(req.params.movieId);
        const movieWithSchedule = await getMoviesWithShowtimes(movieId);

        if (!movieWithSchedule) {
            throw new NotFoundError("Movie");
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Successfully fetched Movie with showtimes`,
            data: movieWithSchedule,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleUpdateMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const movieId = z.uuid().parse(req.params.movieId);
        const validatedData = updateMovieSchema.parse(req.body);
        
        const updatedMovie = await updateMovie(movieId, validatedData);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully updated movie",
            data: updatedMovie,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}