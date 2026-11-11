import { z } from "zod";
import { REQUEST_LIMITS } from "@/lib/constants";

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const createRequestSchema = z.object({
  title: requiredText("Title", REQUEST_LIMITS.title).min(5, "Title must be at least 5 characters."),
  description: requiredText("Description", REQUEST_LIMITS.description).min(
    10,
    "Describe the problem in at least 10 characters.",
  ),
  location: requiredText("Location", REQUEST_LIMITS.location),
});

export const completionNoteSchema = z.object({
  completionNote: requiredText("Completion note", REQUEST_LIMITS.completionNote),
});

export type CreateRequestValues = z.infer<typeof createRequestSchema>;
export type CompletionNoteValues = z.infer<typeof completionNoteSchema>;
