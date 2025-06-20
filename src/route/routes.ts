import { Express, NextFunction, Request, Response } from "express";
import express from 'express';
import { AppError } from "../error/AppError.ts";
import authRouter from "./authRoutes.ts";
import userRouter from "./userRoutes.ts";
import companyRouter from "./companyRoutes.ts";
import courseRouter from "./adminCourseRoutes.ts";
import generalCourseRouter from "./generalCourseRoutes.ts";
import managerRouter from "./managerRoutes.ts";
import notificationRouter from "./notificationRoutes.ts";

export default function (app: Express) {
    app.use(express.json());

    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/admin/companies", companyRouter);
    app.use("/admin/courses", courseRouter);
    app.use("/courses", generalCourseRouter);
    app.use("/manager", managerRouter);
    app.use("/notification", notificationRouter);

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