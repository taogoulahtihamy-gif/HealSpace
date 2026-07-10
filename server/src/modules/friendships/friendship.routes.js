import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  listFriends,
  listIncomingRequests,
  listOutgoingRequests,
  rejectFriendRequest,
  removeFriendship,
  sendFriendRequest,
} from "./friendship.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/requests/:userId", sendFriendRequest);
router.get("/requests/incoming", listIncomingRequests);
router.get("/requests/outgoing", listOutgoingRequests);
router.patch("/requests/:friendshipId/accept", acceptFriendRequest);
router.patch("/requests/:friendshipId/reject", rejectFriendRequest);
router.delete("/requests/:friendshipId", cancelFriendRequest);

router.get("/", listFriends);
router.delete("/:friendshipId", removeFriendship);

export default router;
