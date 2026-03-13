import { Router } from "express";
import { handleAddScreen, handleDeleteScreen, handleGetAllScreens, handleGetScreenById, handleUpdateScreen } from "../../controllers/index.js";

const screenRouter = Router();

screenRouter.post("/", handleAddScreen);
screenRouter.get("/", handleGetAllScreens);
screenRouter.get("/:id", handleGetScreenById);
screenRouter.patch("/:id", handleUpdateScreen);
screenRouter.delete("/:id", handleDeleteScreen);

export { screenRouter };
