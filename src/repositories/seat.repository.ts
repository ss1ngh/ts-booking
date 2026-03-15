import { NotFoundError } from "../utils/errors/AppError.js";
import { prisma } from "../config/index.js";
import { Prisma } from "@prisma/client";
import {
  CreateSeatInput,
  UpdateSeatInput,
  PaginationQuery,
} from "../types/index.js";

const safeSeatSelect = {
  id: true,
  row: true,
  number: true,
  type: true,
  screenId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SeatSelect;

export const addSeat = async (data: CreateSeatInput) => {
  const screen = await prisma.screen.findUnique({
    where: { id: data.screenId },
  });
  if (!screen) {
    throw new NotFoundError("Screen");
  }
  return await prisma.seat.create({
    data,
    select: safeSeatSelect,
  });
};

export const deleteSeat = async (id: string) => {
  try {
    await prisma.seat.delete({
      where: { id },
      select: safeSeatSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Seat");
    }
    throw error;
  }
};

export const getSeatById = async (id: string) => {
  const seat = await prisma.seat.findUnique({
    where: { id },
    select: safeSeatSelect,
  });

  if (!seat) throw new NotFoundError("Seat");
  return seat;
};

export const getAllSeats = async (options?: PaginationQuery) => {
  return await prisma.seat.findMany({
    skip: options?.skip,
    take: options?.take ?? 50,
    orderBy: {
      createdAt: "desc",
    },
    select: safeSeatSelect,
  });
};

export const updateSeat = async (id: string, data: UpdateSeatInput) => {
  try {
    const updatedSeat = await prisma.seat.update({
      where: { id },
      data,
      select: safeSeatSelect,
    });
    return updatedSeat;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Seat");
    }
    throw error;
  }
};
