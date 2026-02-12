import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getMessages } from "../controllers/message.controller.js";

const messageRouter = express.Router();

messageRouter.get("/:matchId", protect, getMessages);

export default messageRouter;
