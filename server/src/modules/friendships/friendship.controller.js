import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { FRIENDSHIP_MESSAGES } from "./friendship.constants.js";
import * as friendshipService from "./friendship.service.js";

export const sendFriendRequest = asyncHandler(
  async (req, res) => {
    const friendship =
      await friendshipService.sendFriendRequest(
        req.user.id,
        req.params.userId,
      );

    return ApiResponse.created(
      res,
      friendship,
      FRIENDSHIP_MESSAGES.REQUEST_SENT,
    );
  },
);

export const listIncomingRequests = asyncHandler(
  async (req, res) => {
    const result =
      await friendshipService.listIncomingRequests(
        req.user.id,
        req.query,
      );

    return ApiResponse.success(
      res,
      result,
      FRIENDSHIP_MESSAGES.REQUESTS_LISTED,
    );
  },
);

export const listOutgoingRequests = asyncHandler(
  async (req, res) => {
    const result =
      await friendshipService.listOutgoingRequests(
        req.user.id,
        req.query,
      );

    return ApiResponse.success(
      res,
      result,
      FRIENDSHIP_MESSAGES.REQUESTS_LISTED,
    );
  },
);

export const listFriends = asyncHandler(
  async (req, res) => {
    const result =
      await friendshipService.listFriends(
        req.user.id,
        req.query,
      );

    return ApiResponse.success(
      res,
      result,
      FRIENDSHIP_MESSAGES.FRIENDS_LISTED,
    );
  },
);

export const acceptFriendRequest = asyncHandler(
  async (req, res) => {
    const friendship =
      await friendshipService.acceptFriendRequest(
        req.user.id,
        req.params.friendshipId,
      );

    return ApiResponse.success(
      res,
      friendship,
      FRIENDSHIP_MESSAGES.REQUEST_ACCEPTED,
    );
  },
);

export const rejectFriendRequest = asyncHandler(
  async (req, res) => {
    const friendship =
      await friendshipService.rejectFriendRequest(
        req.user.id,
        req.params.friendshipId,
      );

    return ApiResponse.success(
      res,
      friendship,
      FRIENDSHIP_MESSAGES.REQUEST_REJECTED,
    );
  },
);

export const cancelFriendRequest = asyncHandler(
  async (req, res) => {
    await friendshipService.cancelFriendRequest(
      req.user.id,
      req.params.friendshipId,
    );

    return ApiResponse.success(
      res,
      null,
      FRIENDSHIP_MESSAGES.REQUEST_CANCELLED,
    );
  },
);

export const removeFriendship = asyncHandler(
  async (req, res) => {
    await friendshipService.removeFriendship(
      req.user.id,
      req.params.friendshipId,
    );

    return ApiResponse.success(
      res,
      null,
      FRIENDSHIP_MESSAGES.FRIENDSHIP_REMOVED,
    );
  },
);
