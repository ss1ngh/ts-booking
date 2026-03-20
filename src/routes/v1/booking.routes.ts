import { Router } from "express";
import {
  handleAddBooking,
  handleDeleteBooking,
  handleGetAllBookings,
  handleGetBookingById,
  handleUpdateBooking,
} from "../../controllers/index.js";
import {
  aggressiveLimiter,
  normalLimiter,
} from "../../utils/rateLimit/rateLimit.helper.js";

const bookingRouter = Router();

bookingRouter.post("/", aggressiveLimiter, handleAddBooking);
bookingRouter.get("/", normalLimiter, handleGetAllBookings);
bookingRouter.get("/:id", normalLimiter, handleGetBookingById);
bookingRouter.patch("/:id", aggressiveLimiter, handleUpdateBooking);
bookingRouter.delete("/:id", normalLimiter, handleDeleteBooking);

export { bookingRouter };
