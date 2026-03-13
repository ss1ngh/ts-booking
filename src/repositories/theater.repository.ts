import { NotFoundError } from "../utils/AppError.js";
import { prisma } from "../config/index.js";
import { Prisma } from "@prisma/client";
import { CreateTheaterInput, UpdateTheaterInput, PaginationQuery } from "../types/index.js";

const safeTheaterSelect = {
    id: true,
    name: true,
    location: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.TheaterSelect;

export const addTheater = async (data: CreateTheaterInput) => {
    return await prisma.theater.create({
        data,
        select: safeTheaterSelect
    });
};

export const deleteTheater = async (id: string) => {
    try {
        await prisma.theater.delete({
            where: { id },
            select: safeTheaterSelect
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundError("Theater");
        }
        throw error;
    }
}

export const getTheaterById = async (id: string) => {
    const theater = await prisma.theater.findUnique({ 
        where: { id },
        select: safeTheaterSelect
    });

    if(!theater) throw new NotFoundError("Theater");
    return theater;
}

export const getAllTheaters = async (options?: PaginationQuery) => {
    return await prisma.theater.findMany({
        skip: options?.skip,
        take: options?.take ?? 50,
        orderBy: {
            createdAt: "desc"
        },
        select: safeTheaterSelect
    });
}

export const updateTheater = async (id: string, data: UpdateTheaterInput) => {
    try {
        const updatedTheater = await prisma.theater.update({
            where: { id },
            data,
            select: safeTheaterSelect
        });
        return updatedTheater;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundError("Theater");
        }
        throw error;
    }
}
