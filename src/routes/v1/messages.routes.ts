import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getMessages, sendMessage, getConversations } from "../controllers/message.controller";

const router = Router();
router.use(authenticate);

router.get("/",             getConversations);
router.get("/thread",       getMessages);
router.post("/",            sendMessage);

export default router;
