import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { ADMIN_MESSAGES } from "./administration.constants.js";
import * as administrationService from "./administration.service.js";

export const getStatistics = asyncHandler(
  async (req, res) => {
    const statistics =
      await administrationService.getStatistics(
        req.user,
      );

    return ApiResponse.success(
      res,
      statistics,
      ADMIN_MESSAGES.STATISTICS_FETCHED,
    );
  },
);

export const listUsers = asyncHandler(
  async (req, res) => {
    const result =
      await administrationService.listUsers(
        req.user,
        req.query,
      );

    return ApiResponse.success(
      res,
      result,
      ADMIN_MESSAGES.USERS_LISTED,
    );
  },
);

export const getUser = asyncHandler(
  async (req, res) => {
    const user =
      await administrationService.getUser(
        req.user,
        req.params.userId,
      );

    return ApiResponse.success(
      res,
      user,
      ADMIN_MESSAGES.USER_FETCHED,
    );
  },
);

export const updateUserRole = asyncHandler(
  async (req, res) => {
    const user =
      await administrationService.updateUserRole(
        req.user,
        req.params.userId,
        req.body.role,
        req.body.note,
      );

    return ApiResponse.success(
      res,
      user,
      ADMIN_MESSAGES.USER_ROLE_UPDATED,
    );
  },
);

export const updateUserStatus = asyncHandler(
  async (req, res) => {
    const user =
      await administrationService.updateUserStatus(
        req.user,
        req.params.userId,
        req.body.status,
        req.body.note,
      );

    return ApiResponse.success(
      res,
      user,
      ADMIN_MESSAGES.USER_STATUS_UPDATED,
    );
  },
);

export const listPosts = asyncHandler(
  async (req, res) => {
    const result =
      await administrationService.listPosts(
        req.user,
        req.query,
      );

    return ApiResponse.success(
      res,
      result,
      ADMIN_MESSAGES.POSTS_LISTED,
    );
  },
);

export const updatePostStatus = asyncHandler(
  async (req, res) => {
    const post =
      await administrationService.updatePostStatus(
        req.user,
        req.params.postId,
        req.body.status,
        req.body.note,
      );

    return ApiResponse.success(
      res,
      post,
      ADMIN_MESSAGES.POST_STATUS_UPDATED,
    );
  },
);

export const listGroups = asyncHandler(
  async (req, res) => {
    const result =
      await administrationService.listGroups(
        req.user,
        req.query,
      );

    return ApiResponse.success(
      res,
      result,
      ADMIN_MESSAGES.GROUPS_LISTED,
    );
  },
);

export const deleteGroup = asyncHandler(
  async (req, res) => {
    const group =
      await administrationService.deleteGroup(
        req.user,
        req.params.groupId,
      );

    return ApiResponse.success(
      res,
      group,
      ADMIN_MESSAGES.GROUP_DELETED,
    );
  },
);

export const listReports = asyncHandler(
  async (req, res) => {
    const result =
      await administrationService.listReports(
        req.user,
        req.query,
      );

    return ApiResponse.success(
      res,
      result,
      ADMIN_MESSAGES.REPORTS_LISTED,
    );
  },
);

export const listActions = asyncHandler(
  async (req, res) => {
    const result =
      await administrationService.listActions(
        req.user,
        req.query,
      );

    return ApiResponse.success(
      res,
      result,
      ADMIN_MESSAGES.ACTIONS_LISTED,
    );
  },
);
