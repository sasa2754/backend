import { Express, NextFunction, Request, Response } from "express";
import express from 'express';
import { AppError } from "../error/AppError.ts";
import authRouter from "./authRoutes.ts";
import userRouter from "./userRoutes.ts";
import companyRouter from "./companyRoutes.ts";
import courseRouter from "./courseRoutes.ts";

export default function (app: Express) {
    app.use(express.json());

    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/admin/companies", companyRouter);
    app.use("/admin/course", courseRouter);

    app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
        let status = 500;
        const response = { response: err.message };

        if (err instanceof AppError) {
        status = err.status;
        }

        res.status(status).json(response);

        next();
    });
}