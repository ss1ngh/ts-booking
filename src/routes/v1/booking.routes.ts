import { Router } from "express";
import { handleAddBooking, handleDeleteBooking, handleGetAllBookings, handleGetBookingById, handleUpdateBooking } from "../../controllers/index.js";

const bookingRouter = Router();

bookingRouter.post("/", handleAddBooking);
bookingRouter.get("/", handleGetAllBookings);
bookingRouter.get("/:id", handleGetBookingById);
bookingRouter.patch("/:id", handleUpdateBooking);
bookingRouter.delete("/:id", handleDeleteBooking);

export { bookingRouter };
