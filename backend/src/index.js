import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

// import authRoutes from "./routes/auth.route.js";
// import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";
import envConfig from "./config/env.config.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { corsOptions } from "./config/cors.config.js";

import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import adminRoute from "./routes/admin.route.js";

dotenv.config();

const PORT = envConfig.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);

app.use(errorMiddleware);

if (envConfig.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
