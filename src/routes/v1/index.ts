import { Router } from "express";
import { movieRouter } from "./movies.routes.js";
import { userRouter } from "./user.routes.js";
<<<<<<< Updated upstream
=======
import { theaterRouter } from "./theater.routes.js";
import { screenRouter } from "./screen.routes.js";
import { seatRouter } from "./seat.routes.js";
import { showtimeRouter } from "./showtime.routes.js";
import { bookingRouter } from "./booking.routes.js";
import { normalLimiter } from "../../utils/rateLimit/rateLimit.helper.js";
>>>>>>> Stashed changes

const v1 = Router();

v1.use("/users", userRouter);
<<<<<<< Updated upstream
=======
v1.use("/bookings", bookingRouter);

v1.use(normalLimiter);

v1.use("/movies", movieRouter);
v1.use("/theaters", theaterRouter);
v1.use("/screens", screenRouter);
v1.use("/seats", seatRouter);
v1.use("/showtimes", showtimeRouter);
>>>>>>> Stashed changes

export default v1;
