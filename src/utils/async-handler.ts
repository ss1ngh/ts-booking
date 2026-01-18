import { Request, Response, NextFunction } from 'express';

type asyncController = (req : Request, res:Response, next:NextFunction) => Promise<any>;

function asyncHandler(fn : asyncController) {
    return function(req: Request, res: Response, next: NextFunction){
        Promise.resolve(fn(req, res, next))
            .catch(err => next(err));
    }
}

export default asyncHandler;