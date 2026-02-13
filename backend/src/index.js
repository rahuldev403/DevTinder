import "dotenv/config";
import express from "express";
import cors from "cors";
import conncetDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import messageRouter from "./routes/message.route.js";
import http from "http";
import { Server } from "socket.io";
import { chatSocket } from "./sockets/chatSocket.js";
import rateLimit from "express-rate-limit";

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests,please try again later",
});

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);
conncetDb();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
chatSocket(io);
const port = 8000 || process.env.PORT;

app.use("/api/auth", authRouter);
app.use("/api/user", userRoute);
app.use("/api/messages", messageRouter);

server.listen(port, () => {
  console.log(`serever is running on port: http://localhost:${port}`);
});
