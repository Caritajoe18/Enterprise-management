import express, { json, urlencoded, Response, Request, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import createError from "http-errors";
import routes from "../routes"; // Ensure this is your main routing file
import cookieParser from "cookie-parser";
import adminRoutes from "../routes/adminRoutes";

export interface IRequest extends Request {
  user?: string;
}

const app = express();

// Middleware setup
app.use(cors());
app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(cookieParser());

// Mount the admin routes
app.use('/admin', adminRoutes);

// Mount the main routes if applicable
app.use(routes);

// 404 error handler
app.use((req: IRequest, res: Response, next: NextFunction) => {
  next(createError(404));
});

// General error handler
app.use((err: createError.HttpError, req: IRequest, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Change this to respond with JSON if not rendering views
  res.status(err.status || 500);
  res.json({ error: res.locals.message }); // Return JSON for errors
});

export default app;
