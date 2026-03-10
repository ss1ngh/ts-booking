import { Router } from "express";

const movieRouter = Router();

router.get('/', getMovies);
router.get('/all', getAllMovies);
router.post('/', createMovie);


export default movieRouter;