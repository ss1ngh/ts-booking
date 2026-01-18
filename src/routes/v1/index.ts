import express from 'express';
import movieRoutes from './movie.routes';


const router = express.Router();

router.use('/movies', movieRoutes);

export default router;