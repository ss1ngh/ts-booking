import { NotFoundError } from "../utils/AppError.js";
import { prisma } from "../config/index.js";
import { Prisma } from "@prisma/client";
import { CreateShowtimeInput, UpdateShowtimeInput, PaginationQuery } from "../types/index.js";

const safeShowtimeSelect = {
    id: true,
    startTime: true,
    endTime: true,
    movieId: true,
    screenId: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.ShowtimeSelect;

export const addShowtime = async (data: CreateShowtimeInput) => {
    return await prisma.showtime.create({
        data,
        select: safeShowtimeSelect
    });
};

export const deleteShowtime = async (id: string) => {
    try {
        await prisma.showtime.delete({
            where: { id },
            select: safeShowtimeSelect
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundError("Showtime");
        }
        throw error;
    }
}

export const getShowtimeById = async (id: string) => {
    const showtime = await prisma.showtime.findUnique({ 
        where: { id },
        select: safeShowtimeSelect
    });

    if(!showtime) throw new NotFoundError("Showtime");
    return showtime;
}

export const getAllShowtimes = async (options?: PaginationQuery) => {
    return await prisma.showtime.findMany({
        skip: options?.skip,
        take: options?.take ?? 50,
        orderBy: {
            createdAt: "desc"
        },
        select: safeShowtimeSelect
    });
}

export const updateShowtime = async (id: string, data: UpdateShowtimeInput) => {
    try {
        const updatedShowtime = await prisma.showtime.update({
            where: { id },
            data,
            select: safeShowtimeSelect
        });
        return updatedShowtime;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundError("Showtime");
        }
        throw error;
    }
}
