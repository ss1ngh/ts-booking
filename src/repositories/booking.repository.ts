  import { AppError, NotFoundError } from "../utils/errors/AppError.js";
  import { prisma } from "../config/index.js";
  import { Prisma } from "@prisma/client";
  import {
    CreateBookingInput,
    UpdateBookingInput,
    PaginationQuery,
  } from "../types/index.js";

  const safeBookingSelect = {
    id: true,
    userId: true,
    showtimeId: true,
    status: true,
    createdAt: true,
  } satisfies Prisma.BookingSelect;

  export const addBooking = async (data: CreateBookingInput) => {
    return await prisma.$transaction(async (tx) => {
      //verify showtime exists
      const showtime = await tx.showtime.findUnique({
        where: { id: data.showtimeId },
        include: { screen: true },
      });

      if (!showtime) {
        throw new AppError("Showtime not found", 404);
      }

      //fetch requested seats to ensure they exist and belong to the correct screen
      const seats = await tx.seat.findMany({
        where: {
          id: { in: data.seatIds },
        },
      });

      if (seats.length !== data.seatIds.length) {
        throw new AppError("One or more invalid seats selected", 400);
      }

      const invalidScreenSeats = seats.filter(
        (seat) => seat.screenId !== showtime.screenId,
      );
      if (invalidScreenSeats.length > 0) {
        throw new AppError(
          "Selected seats do not belong to the showtime's screen",
          400,
        );
      }

      //check for overlapping Confirmed or Pending bookings for these seats on this showtime
      const overlappingBookings = await tx.booking.findFirst({
        where: {
          showtimeId: data.showtimeId,
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
          seats: {
            some: {
              id: { in: data.seatIds },
            },
          },
        },
      });

      if (overlappingBookings) {
        throw new AppError(
          "One or more selected seats are already booked or reserved",
          409,
        );
      }

      // create the booking securely
      const booking = await tx.booking.create({
        data: {
          userId: data.userId,
          showtimeId: data.showtimeId,
          status: "PENDING",
          seats: {
            connect: data.seatIds.map((id : string) => ({ id })),
          },
        },
        select: safeBookingSelect,
      });
      return booking;
    });
  };

  export const deleteBooking = async (id: string) => {
    try {
      await prisma.booking.delete({
        where: { id },
        select: safeBookingSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Booking");
      }
      throw error;
    }
  };

  export const getBookingById = async (id: string) => {
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        ...safeBookingSelect,
        seats: {
          select: {
            id: true,
            row: true,
            number: true,
          },
        },
      },
    });

    if (!booking) throw new NotFoundError("Booking");
    return booking;
  };

  export const getAllBookings = async (options?: PaginationQuery) => {
    return await prisma.booking.findMany({
      skip: options?.skip,
      take: options?.take ?? 50,
      orderBy: {
        createdAt: "desc",
      },
      select: safeBookingSelect,
    });
  };

  export const updateBooking = async (id: string, data: UpdateBookingInput) => {
    try {
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data,
        select: safeBookingSelect,
      });
      return updatedBooking;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Booking");
      }
      throw error;
    }
  };
