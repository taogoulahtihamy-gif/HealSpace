import { z } from "zod";

export const createDirectConversationSchema = z.object({
  participantId: z.string().min(1, "Le participant est obligatoire."),
});

export const createGroupConversationSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères."),
  participantIds: z
    .array(z.string().min(1, "Participant invalide."))
    .min(1, "Au moins un participant est obligatoire."),
});
