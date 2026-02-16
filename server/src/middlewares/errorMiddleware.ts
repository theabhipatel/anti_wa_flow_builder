import { Request, Response, NextFunction } from 'express';

export interface IAppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export class AppError extends Error implements IAppError {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorMiddleware = (
    err: IAppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[ERROR] ${statusCode}: ${message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export const notFoundMiddleware = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
    });
};
