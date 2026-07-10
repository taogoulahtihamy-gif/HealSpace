import { z } from "zod";

export const createGroupInvitationSchema = z
  .object({
    inviteeId: z
      .string({
        required_error: "L'utilisateur à inviter est obligatoire.",
      })
      .trim()
      .min(1, "L'utilisateur à inviter est obligatoire."),
  })
  .strict();
