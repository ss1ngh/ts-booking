import { Router } from "express";
import { handleAddTheater, handleDeleteTheater, handleGetAllTheaters, handleGetTheaterById, handleUpdateTheater } from "../../controllers/index.js";

const theaterRouter = Router();

theaterRouter.post("/", handleAddTheater);
theaterRouter.get("/", handleGetAllTheaters);
theaterRouter.get("/:id", handleGetTheaterById);
theaterRouter.patch("/:id", handleUpdateTheater);
theaterRouter.delete("/:id", handleDeleteTheater);

export { theaterRouter };
