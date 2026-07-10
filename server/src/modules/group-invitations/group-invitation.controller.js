import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { GROUP_INVITATION_MESSAGES } from "./group-invitation.constants.js";
import * as service from "./group-invitation.service.js";

export const createGroupInvitation = asyncHandler(async (req, res) => {
  const invitation = await service.createGroupInvitation(
    req.user.id,
    req.params.groupId,
    req.body,
  );

  return ApiResponse.created(
    res,
    invitation,
    GROUP_INVITATION_MESSAGES.CREATED,
  );
});

export const listMyGroupInvitations = asyncHandler(async (req, res) => {
  const result = await service.listMyGroupInvitations(
    req.user.id,
    req.query,
  );

  return ApiResponse.success(
    res,
    result,
    GROUP_INVITATION_MESSAGES.LISTED,
  );
});

export const acceptGroupInvitation = asyncHandler(async (req, res) => {
  const invitation = await service.acceptGroupInvitation(
    req.user.id,
    req.params.invitationId,
  );

  return ApiResponse.success(
    res,
    invitation,
    GROUP_INVITATION_MESSAGES.ACCEPTED,
  );
});

export const rejectGroupInvitation = asyncHandler(async (req, res) => {
  const invitation = await service.rejectGroupInvitation(
    req.user.id,
    req.params.invitationId,
  );

  return ApiResponse.success(
    res,
    invitation,
    GROUP_INVITATION_MESSAGES.REJECTED,
  );
});

export const cancelGroupInvitation = asyncHandler(async (req, res) => {
  const invitation = await service.cancelGroupInvitation(
    req.user.id,
    req.params.groupId,
    req.params.invitationId,
  );

  return ApiResponse.success(
    res,
    invitation,
    GROUP_INVITATION_MESSAGES.CANCELLED,
  );
});
