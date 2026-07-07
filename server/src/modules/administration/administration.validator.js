import { z } from "zod";
import {
  ADMIN_LIMITS,
  ADMIN_POST_STATUSES,
  ADMIN_USER_ROLES,
  ADMIN_USER_STATUSES,
} from "./administration.constants.js";

const positiveIntegerQuerySchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d*$/, {
    message: "La valeur doit être un entier strictement positif.",
  });

const adminNoteSchema = z
  .string({
    required_error: "La note administrative est obligatoire.",
  })
  .trim()
  .min(
    ADMIN_LIMITS.NOTE_MIN,
    `La note doit contenir au moins ${ADMIN_LIMITS.NOTE_MIN} caractères.`,
  )
  .max(
    ADMIN_LIMITS.NOTE_MAX,
    `La note ne doit pas dépasser ${ADMIN_LIMITS.NOTE_MAX} caractères.`,
  );

const basePaginationSchema = {
  page: positiveIntegerQuerySchema.optional(),
  limit: positiveIntegerQuerySchema.optional(),
};

export const listAdminUsersQuerySchema = z
  .object({
    ...basePaginationSchema,
    search: z
      .string()
      .trim()
      .max(ADMIN_LIMITS.SEARCH_MAX)
      .optional(),
    role: z.enum(Object.values(ADMIN_USER_ROLES)).optional(),
    status: z.enum(Object.values(ADMIN_USER_STATUSES)).optional(),
  })
  .passthrough();

export const updateAdminUserRoleSchema = z
  .object({
    role: z.enum(Object.values(ADMIN_USER_ROLES)),
    note: adminNoteSchema,
  })
  .strict();

export const updateAdminUserStatusSchema = z
  .object({
    status: z.enum(Object.values(ADMIN_USER_STATUSES)),
    note: adminNoteSchema,
  })
  .strict();

export const listAdminPostsQuerySchema = z
  .object({
    ...basePaginationSchema,
    search: z
      .string()
      .trim()
      .max(ADMIN_LIMITS.SEARCH_MAX)
      .optional(),
    status: z.enum(Object.values(ADMIN_POST_STATUSES)).optional(),
    visibility: z
      .enum(["PUBLIC", "GROUP", "PRIVATE"])
      .optional(),
    authorId: z.string().trim().min(1).optional(),
  })
  .passthrough();

export const updateAdminPostStatusSchema = z
  .object({
    status: z.enum(Object.values(ADMIN_POST_STATUSES)),
    note: adminNoteSchema,
  })
  .strict();

export const listAdminGroupsQuerySchema = z
  .object({
    ...basePaginationSchema,
    search: z
      .string()
      .trim()
      .max(ADMIN_LIMITS.SEARCH_MAX)
      .optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
    ownerId: z.string().trim().min(1).optional(),
  })
  .passthrough();

export const listAdminReportsQuerySchema = z
  .object({
    ...basePaginationSchema,
    status: z
      .enum([
        "PENDING",
        "UNDER_REVIEW",
        "RESOLVED",
        "REJECTED",
      ])
      .optional(),
    targetType: z
      .enum([
        "USER",
        "POST",
        "COMMENT",
        "MESSAGE",
        "GROUP",
      ])
      .optional(),
    reason: z
      .enum([
        "HARASSMENT",
        "HATE_SPEECH",
        "SPAM",
        "VIOLENCE",
        "SELF_HARM",
        "INAPPROPRIATE_CONTENT",
        "OTHER",
      ])
      .optional(),
    reporterId: z.string().trim().min(1).optional(),
    reviewerId: z.string().trim().min(1).optional(),
  })
  .passthrough();

export const listAdminActionsQuerySchema = z
  .object({
    ...basePaginationSchema,
    action: z
      .enum([
        "REPORT_REVIEW_STARTED",
        "REPORT_RESOLVED",
        "REPORT_REJECTED",
        "USER_STATUS_CHANGED",
        "USER_ROLE_CHANGED",
        "POST_STATUS_CHANGED",
        "GROUP_DELETED",
      ])
      .optional(),
    moderatorId: z.string().trim().min(1).optional(),
    targetUserId: z.string().trim().min(1).optional(),
    reportId: z.string().trim().min(1).optional(),
  })
  .passthrough();
