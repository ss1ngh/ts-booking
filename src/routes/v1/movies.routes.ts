import { Router } from "express";
import { handleAddMovie, handleDeleteMovie, handleGetAllMovies, handleGetMovieById, handleGetMovieWithShowtimes, handleUpdateMovie } from "../../controllers/index.js";

const movieRouter = Router();

movieRouter.get('/', handleGetAllMovies);
movieRouter.get('/:movieId', handleGetMovieById);
movieRouter.get('/:movieId/showtimes', handleGetMovieWithShowtimes);
movieRouter.post('/', handleAddMovie);
movieRouter.delete('/:movieId', handleDeleteMovie);
movieRouter.patch('/:movieId', handleUpdateMovie);


export { movieRouter };