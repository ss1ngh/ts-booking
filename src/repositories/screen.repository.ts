import { NotFoundError } from "../utils/AppError.js";
import { prisma } from "../config/index.js";
import { Prisma } from "@prisma/client";
import { CreateScreenInput, UpdateScreenInput, PaginationQuery } from "../types/index.js";

const safeScreenSelect = {
    id: true,
    number: true,
    theaterId: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.ScreenSelect;

export const addScreen = async (data: CreateScreenInput) => {
    return await prisma.screen.create({
        data,
        select: safeScreenSelect
    });
};

export const deleteScreen = async (id: string) => {
    try {
        await prisma.screen.delete({
            where: { id },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundError("Screen");
        }
        throw error;
    }
}

export const getScreenById = async (id: string) => {
    const screen = await prisma.screen.findUnique({ 
        where: { id },
        select: safeScreenSelect
    });

    if(!screen) throw new NotFoundError("Screen");
    return screen;
}

export const getAllScreens = async (options?: PaginationQuery) => {
    return await prisma.screen.findMany({
        skip: options?.skip,
        take: options?.take ?? 50,
        orderBy: {
            createdAt: "desc"
        },
        select: safeScreenSelect
    });
}

export const updateScreen = async (id: string, data: UpdateScreenInput) => {
    try {
        const updatedScreen = await prisma.screen.update({
            where: { id },
            data,
            select: safeScreenSelect
        });
        return updatedScreen;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundError("Screen");
        }
        throw error;
    }
}
