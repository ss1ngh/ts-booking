import { Prisma } from "@prisma/client";
import { prisma } from "../config";

export const addMovie = async (data: Prisma.MovieCreateInput) => {
    const newMovie = await prisma.movie.create({
        data: data
    });

    return newMovie;
};


