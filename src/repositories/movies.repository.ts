import { NotFoundError } from "../utils/errors/AppError.js";
import { prisma } from "../config/index.js";
import { Prisma } from "@prisma/client";
import {
  CreateMovieInput,
  UpdateMovieInput,
  PaginationQuery,
} from "../types/index.js";

export const addMovie = async (data: CreateMovieInput) => {
  const response = await prisma.movie.create({
    data,
  });

  return response;
};

export const deleteMovie = async (movieId: string) => {
  try {
    await prisma.movie.delete({
      where: { movieId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Movie");
    }
    throw error;
  }
};

export const getMovieById = async (movieId: string) => {
  const movie = await prisma.movie.findUnique({
    where: { movieId },
  });

  if (!movie) throw new NotFoundError("Movie");
  return movie;
};

export const getAllMovies = async (options?: PaginationQuery) => {
  return await prisma.movie.findMany({
    skip: options?.skip,
    take: options?.take ?? 50,
    orderBy: {
      movieId: "asc",
    },
  });
};

export const getMoviesWithShowtimes = async (movieId: string) => {
  const movie = await prisma.movie.findUnique({
    where: { movieId },
    include: {
      showtimes: {
        include: {
          screen: true,
        },
        orderBy: {
          startTime: "asc",
        },
      },
    },
  });

  if (!movie) throw new NotFoundError("Movie");
  return movie;
};

export const updateMovie = async (movieId: string, data: UpdateMovieInput) => {
  try {
    const updatedMovie = await prisma.movie.update({
      where: { movieId },
      data,
    });
    return updatedMovie;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Movie");
    }
    throw error;
  }
};
