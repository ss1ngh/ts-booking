import { NotFoundError } from "../utils/AppError.js";
import { prisma } from "../config/index.js";
import { Prisma } from "@prisma/client";

export const addMovie = async (data: Prisma.MovieCreateInput) => {
    const response = await prisma.movie.create({
        data
    });

    return response;
};

export const deleteMovie = async (movieId: string) => {
    try {
        await prisma.movie.delete({
            where: { movieId }
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundError("Movie");
        }
        throw error;
    }
}

export const getMovieById = async (movieId: string) => {
    return await prisma.movie.findUnique({
        where: { movieId }
    });
}

export const getAllMovies = async (options?: { skip?: number; take?: number }) => {
    return await prisma.movie.findMany({
        skip: options?.skip,
        take: options?.take ?? 50,
    });
}

export const getMoviesWithShowtimes = async (movieId: string) => {

    return await prisma.movie.findUnique({
        where: { movieId },
        include: {
            showtimes: {
                include: {
                    screen: true
                },
                orderBy: {
                    startTime: "asc"
                }
            }
        }
    })
}

export const updateMovie = async (movieId: string, data: Prisma.MovieUpdateInput) => {
    try {
        const updatedMovie = await prisma.movie.update({
            where: { movieId },
            data
        });
        return updatedMovie;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundError("Movie");
        }
        throw error;
    }
}
