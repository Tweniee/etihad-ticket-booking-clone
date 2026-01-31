import { z } from "zod";

// Login by user ID or name
export const loginSchema = z.object({
  userId: z.number().optional(),
  name: z.string().optional(),
}).refine((data) => data.userId !== undefined || data.name !== undefined, {
  message: "Either userId or name must be provided",
});

// Register new user
export const registerSchema = z.object({
  category: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required"),
  citizenship: z.string().min(1, "Citizenship is required"),
  uaeResident: z.boolean(),
  details: z.string().optional(),
});

// Update user
export const updateUserSchema = z.object({
  category: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  citizenship: z.string().min(1).optional(),
  uaeResident: z.boolean().optional(),
  details: z.string().optional(),
});

// Travel history schemas
export const createTravelHistorySchema = z.object({
  userId: z.number(),
  destination: z.string().min(1, "Destination is required"),
  travelDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  purpose: z.string().optional(),
});

export const updateTravelHistorySchema = z.object({
  destination: z.string().min(1).optional(),
  travelDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }).optional(),
  purpose: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateTravelHistoryInput = z.infer<typeof createTravelHistorySchema>;
export type UpdateTravelHistoryInput = z.infer<typeof updateTravelHistorySchema>;
