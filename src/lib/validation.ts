import { z } from "zod"

export const activitySchema = z
  .object({
    title: z.string().min(1).max(80),
    category: z.enum([
      "field_service",
      "work",
      "meeting",
      "personal",
      "rest",
      "other",
    ]),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    companion: z.string().max(80).optional(),
    serviceType: z
      .enum([
        "house_to_house",
        "informal",
        "public",
        "phone",
        "letters",
        "return_visit",
        "bible_study",
        "other",
      ])
      .optional(),
    location: z.string().max(120).optional(),
    notes: z.string().max(2000).optional(),
    status: z.enum(["planned", "completed", "cancelled"]),
  })
  .refine((value) => value.endTime > value.startTime, {
    message: "end",
    path: ["endTime"],
  })

export const experienceSchema = z.object({
  title: z.string().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum([
    "nice_response",
    "bible_study",
    "return_visit",
    "informal",
    "encouragement",
    "personal_lesson",
    "other",
  ]),
  text: z.string().min(1).max(8000),
  learned: z.string().max(2000).optional(),
  followUpDate: z.string().optional(),
  visibility: z.enum(["private", "share_ready"]),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(60).optional(),
})
