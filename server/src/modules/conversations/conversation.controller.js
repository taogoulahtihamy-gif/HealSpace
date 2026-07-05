import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import {
  createDirectConversationService,
  createGroupConversationService,
  getConversationByIdService,
  getConversationsService,
  leaveConversationService,
} from "./conversation.service.js";
import { CONVERSATION_MESSAGES } from "./conversation.constants.js";

export const createDirectConversation = asyncHandler(async (req, res) => {
  const result = await createDirectConversationService(req.user.id, req.body);

  return ApiResponse.created(res, result, CONVERSATION_MESSAGES.CREATED);
});

export const createGroupConversation = asyncHandler(async (req, res) => {
  const result = await createGroupConversationService(req.user.id, req.body);

  return ApiResponse.created(res, result, CONVERSATION_MESSAGES.CREATED);
});

export const getConversations = asyncHandler(async (req, res) => {
  const result = await getConversationsService(req.user.id);

  return ApiResponse.success(res, result, CONVERSATION_MESSAGES.LIST_FETCHED);
});

export const getConversationById = asyncHandler(async (req, res) => {
  const result = await getConversationByIdService(req.user.id, req.params.id);

  return ApiResponse.success(res, result, CONVERSATION_MESSAGES.FETCHED);
});

export const leaveConversation = asyncHandler(async (req, res) => {
  await leaveConversationService(req.user.id, req.params.id);

  return ApiResponse.success(res, null, CONVERSATION_MESSAGES.LEFT);
});
