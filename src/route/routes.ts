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
import homeRouter from "./homeRoutes.ts";
import activityRouter from "./activityRoutes.ts";
import profileRouter from "./profileRoutes.ts";
import generalApiRouter from "./generalApiRoutes.ts";
import calendarRouter from "./calendarRoutes.ts";
import certificateRouter from "./certificateRoutes.ts";
import testRouter from "./testRoutes.ts";

export default function (app: Express) {
    app.use(express.json());

    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
    app.use("/api/admin/companies", companyRouter);
    app.use("/api/admin/courses", courseRouter);
    app.use("/api/courses", generalCourseRouter);
    app.use("/api/manager", managerRouter);
    app.use("/api/notification", notificationRouter);
    app.use("/api/home", homeRouter);
    app.use("/api/activities", activityRouter);
    app.use("/api/profile", profileRouter);
    app.use("/api/", generalApiRouter);
    app.use("/api/calendar", calendarRouter);
    app.use("/api/certificate", certificateRouter);
    app.use("/api/test", testRouter);

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