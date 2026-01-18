import { Logger } from '../config';
import {StatusCodes} from 'http-status-codes';
import { MovieService } from '../services';
import asyncHandler from '../utils/async-handler';
import { Request, Response } from 'express';


export const addMovie = asyncHandler(async(req : Request, res : Response) => {
    Logger.info('MovieController : addMovie : Request Received' );

    const response = await MovieService.addMovie(req.body);

    return res.status(StatusCodes.CREATED).json({
        success : true,
        message: 'Successfully added movie',
        data : response,
        err : {}
    });
});

