import { Request, Response, NextFunction } from "express";
import { addMovie, deleteMovie, getAllMovies, getMovieById, getMoviesWithShowtimes } from "src/repositories";
import { createMovieSchema } from "src/types";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { NotFoundError } from "src/utils/AppError";


export const handleAddMovie = async(req : Request, res : Response, next : NextFunction) => {
    try {
        //validate input
        const validatedData = createMovieSchema.parse(req.body);
        //db call
        const movie = await addMovie(validatedData);

        return res.status(StatusCodes.CREATED).json({
            success:true,
            message : "Movie added successfully",
            data : movie,
            error : {}
        });
    } catch (error) {
        next(error);
    }
}

export const handleDeleteMovie = async(req : Request, res : Response, next : NextFunction) => {
    try {
        const movieId = z.uuid().parse(req.params.movieId);
        //check
        const existing = await getMovieById(movieId);
        if (!existing) {
            throw new NotFoundError("Movie");
        }
        //db call
        const movie = await deleteMovie(movieId);

        res.status(StatusCodes.OK).json({
            success : true,
            message : "Successfully deleted movie",
            error : {},
            data : movie,
        })
    } catch(error) {
        next(error);
    }
}

export const handleGetMovieById = async(req : Request, res : Response, next : NextFunction) => {
    try{
        const movieId = z.uuid().parse(req.params.movieId);

        const movie = await getMovieById(movieId);

        if(!movie) {
            throw new NotFoundError("Movie")
        }

        res.status(StatusCodes.OK).json({
            success : true,
            message : `Successfully fetched Movie with id : ${movieId}`,
            data : movie,
            error : {}
        })
    } catch (error) {
        next(error);
    }
}


export const handleGetAllMovies = async(req : Request, res : Response, next : NextFunction) => {
    try{
        const movies = await getAllMovies();

        res.status(StatusCodes.OK).json({
            success : true,
            message : "Successfully fetched all Movies",
            data : movies,
            error : {}
        })
    } catch (error) {
        next(error);
    }
}

export const handleGetMovieWithShowtimes = async(req : Request, res : Response, next : NextFunction) => {
    try{
        const movieId = z.uuid().parse(req.params.movieId);

        const movieWithSchedule = await getMoviesWithShowtimes(movieId);

        if(!movieWithSchedule) {
            throw new NotFoundError("Movie")
        }

        res.status(StatusCodes.OK).json({
            success : true,
            message : `Successfully fetched Movie with showtimes`,
            data : movieWithSchedule,
            error : {}
        })
    } catch (error) {
        next(error);
    }
}