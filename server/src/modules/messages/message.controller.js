import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import {
  createMessageService,
  deleteMessageService,
  getConversationMessagesService,
  markMessageAsReadService,
  updateMessageService,
} from "./message.service.js";
import { MESSAGE_MESSAGES } from "./message.constants.js";

export const createMessage = asyncHandler(async (req, res) => {
  const result = await createMessageService(
    req.user.id,
    req.params.conversationId,
    req.body
  );

  return ApiResponse.created(res, result, MESSAGE_MESSAGES.CREATED);
});

export const getConversationMessages = asyncHandler(async (req, res) => {
  const result = await getConversationMessagesService(
    req.user.id,
    req.params.conversationId
  );

  return ApiResponse.success(res, result, MESSAGE_MESSAGES.LIST_FETCHED);
});

export const updateMessage = asyncHandler(async (req, res) => {
  const result = await updateMessageService(
    req.user.id,
    req.params.id,
    req.body
  );

  return ApiResponse.success(res, result, MESSAGE_MESSAGES.UPDATED);
});

export const deleteMessage = asyncHandler(async (req, res) => {
  await deleteMessageService(req.user.id, req.params.id);

  return ApiResponse.success(res, null, MESSAGE_MESSAGES.DELETED);
});

export const markMessageAsRead = asyncHandler(async (req, res) => {
  const result = await markMessageAsReadService(req.user.id, req.params.id);

  return ApiResponse.success(res, result, MESSAGE_MESSAGES.MARKED_AS_READ);
});
