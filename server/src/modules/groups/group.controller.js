import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { GROUP_MESSAGES } from "./group.constants.js";
import * as groupService from "./group.service.js";

export const createGroup = asyncHandler(async (req, res) => {
  const group = await groupService.createGroup(req.user.id, req.body);
  return ApiResponse.created(res, group, GROUP_MESSAGES.CREATED);
});

export const listGroups = asyncHandler(async (req, res) => {
  const result = await groupService.listGroups(req.user.id, req.query);
  return ApiResponse.success(res, result, GROUP_MESSAGES.LISTED);
});

export const listMyGroups = asyncHandler(async (req, res) => {
  const result = await groupService.listMyGroups(
    req.user.id,
    req.query,
  );
  return ApiResponse.success(res, result, GROUP_MESSAGES.LISTED);
});

export const getGroupById = asyncHandler(async (req, res) => {
  const group = await groupService.getGroupById(
    req.user.id,
    req.params.groupId,
  );
  return ApiResponse.success(res, group, GROUP_MESSAGES.RETRIEVED);
});

export const updateGroup = asyncHandler(async (req, res) => {
  const group = await groupService.updateGroup(
    req.user.id,
    req.params.groupId,
    req.body,
  );
  return ApiResponse.success(res, group, GROUP_MESSAGES.UPDATED);
});

export const deleteGroup = asyncHandler(async (req, res) => {
  await groupService.deleteGroup(req.user.id, req.params.groupId);
  return ApiResponse.success(res, null, GROUP_MESSAGES.DELETED);
});

export const joinGroup = asyncHandler(async (req, res) => {
  const member = await groupService.joinGroup(
    req.user.id,
    req.params.groupId,
  );
  return ApiResponse.created(res, member, GROUP_MESSAGES.JOINED);
});

export const leaveGroup = asyncHandler(async (req, res) => {
  await groupService.leaveGroup(req.user.id, req.params.groupId);
  return ApiResponse.success(res, null, GROUP_MESSAGES.LEFT);
});

export const listGroupMembers = asyncHandler(async (req, res) => {
  const result = await groupService.listGroupMembers(
    req.user.id,
    req.params.groupId,
    req.query,
  );
  return ApiResponse.success(
    res,
    result,
    GROUP_MESSAGES.MEMBERS_LISTED,
  );
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const member = await groupService.updateMemberRole(
    req.user.id,
    req.params.groupId,
    req.params.memberId,
    req.body.role,
  );
  return ApiResponse.success(
    res,
    member,
    GROUP_MESSAGES.MEMBER_ROLE_UPDATED,
  );
});

export const removeMember = asyncHandler(async (req, res) => {
  await groupService.removeMember(
    req.user.id,
    req.params.groupId,
    req.params.memberId,
  );
  return ApiResponse.success(res, null, GROUP_MESSAGES.MEMBER_REMOVED);
});
