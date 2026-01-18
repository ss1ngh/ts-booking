import express from 'express';
import { MovieController } from '../../controllers';
const router = express.Router();

router.post('/', MovieController.addMovie);


export default router;