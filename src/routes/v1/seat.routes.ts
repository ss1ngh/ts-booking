import { Router } from "express";
import { handleAddSeat, handleDeleteSeat, handleGetAllSeats, handleGetSeatById, handleUpdateSeat } from "../../controllers/index.js";

const seatRouter = Router();

seatRouter.post("/", handleAddSeat);
seatRouter.get("/", handleGetAllSeats);
seatRouter.get("/:id", handleGetSeatById);
seatRouter.patch("/:id", handleUpdateSeat);
seatRouter.delete("/:id", handleDeleteSeat);

export { seatRouter };
