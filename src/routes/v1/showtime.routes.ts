import { Router } from "express";
import { handleAddShowtime, handleDeleteShowtime, handleGetAllShowtimes, handleGetShowtimeById, handleUpdateShowtime } from "../../controllers/index.js";

const showtimeRouter = Router();

showtimeRouter.post("/", handleAddShowtime);
showtimeRouter.get("/", handleGetAllShowtimes);
showtimeRouter.get("/:id", handleGetShowtimeById);
showtimeRouter.patch("/:id", handleUpdateShowtime);
showtimeRouter.delete("/:id", handleDeleteShowtime);

export { showtimeRouter };
