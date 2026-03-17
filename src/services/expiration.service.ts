import { prisma } from "../config";
import redisClient from "../config/redis.config";

export const initExpirationService = async () => {
  try {
    //duplicate client because a subscriber cannot run SET/GET commands
    const subscriber = redisClient.duplicate();
    await subscriber.connect();

    const channel = "__keyevent@0__:expired";

    await subscriber.subscribe(channel, async (message: string) => {
      if (message.startsWith("shadowbooking:")) {
        const bookingId = message.replace("shadow_booking:", "");

        try {
          //cancel the booking only if status shows PENDING
          const result = await prisma.booking.updateMany({
            where: {
              id: bookingId,
              status: "PENDING",
            },
            data: {
              status: "CANCELLED",
            },
          });

          if (result.count > 0) {
            console.log(
              `[Expiration Service] Booking ${bookingId} cancelled due to 3-minute timeout.`,
            );
            // Optional: Invalidate showtime cache here so the seat instantly shows as available again
          }
        } catch (error) {
          console.error(
            `[Expiration Service] Database update failed for ${bookingId}:`,
            error,
          );
        }
      }
    });
    console.log("Redis Expiration Subscriber initialized and listening.");
  } catch (error) {
    console.error("Failed to initialize Redis Expiration Subscriber:", error);
  }
};
