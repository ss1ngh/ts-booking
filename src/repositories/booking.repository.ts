  import { AppError, NotFoundError } from "../utils/errors/AppError.js";
  import { prisma } from "../config/index.js";
  import { Prisma } from "@prisma/client";
  import { setCache, getCache, deleteCache, acquireLock, releaseLock } from "../utils/index.js";
  import {
    CreateBookingInput,
    UpdateBookingInput,
    PaginationQuery,
  } from "../types/index.js";
import { resourceLimits } from "node:worker_threads";

  const safeBookingSelect = {
    id: true,
    userId: true,
    showtimeId: true,
    status: true,
    createdAt: true,
  } satisfies Prisma.BookingSelect;

  export const addBooking = async (data: CreateBookingInput) => {
    //sort to prevent deadlocks
    const sortedSeatIds = [...data.seatIds].sort();

    const lockResources = sortedSeatIds.map( seatId => `showtime:${data.showtimeId}:seat:${seatId}`);

    const acquiredLocks: string[] = [];
    
    try {
      //sequential lock acquisition
      for(const resource of lockResources) {
        const hasLock = await acquireLock(resource);
        
        if(!hasLock) {
          throw new AppError("Showtime is currently being updated, Please try again in a moment", 429);
        }
        acquiredLocks.push(resource);
      }
      
      return await prisma.$transaction(async (tx) => {
      //verify showtime exists
      const showtime = await tx.showtime.findUnique({
        where: { id:data.showtimeId },
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

      //check for overlaps
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
      //prevent ghost booking
      await setCache(`shadow_booking:${booking.id}`, "pending", 180);
      //cache invalidation
      await deleteCache(`showtime:availability:${data.showtimeId}`);
      return booking;
    });
  } finally {

    //cleanup all acquired locks
    for(const resource of acquiredLocks) {
      await releaseLock(resource.replace('lock:', ''));
    }
  }
};

  export const deleteBooking = async (id: string) => {
    try {
      await prisma.booking.delete({
        where: { id },
        select: safeBookingSelect,
      });

      //delete cache since booking no longer exists
      await deleteCache(`booking:${id}`);

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
    const cacheKey = `booking:${id}`;

    //get booking details from redis
    const cachedBooking = await getCache<any>(cacheKey);
    if(cachedBooking) {
      return cachedBooking;  //cache hit : return immediately
    }

    //cache miss
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

    //set cache to redis
    await setCache(cacheKey, booking, 600);

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

      const cacheKey = `booking:${id}`;
      await deleteCache(cacheKey);

      //delete shadow key on payment confirmation
      if (data.status === "CONFIRMED") {
      await deleteCache(`shadow_booking:${id}`);
      
      // Also invalidate the showtime cache so the seat map reflects the confirmed booking
      await deleteCache(`showtime:availability:${updatedBooking.showtimeId}`);
    }

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
