import { z } from "zod";
import { defineRoute } from "../core/contract";
import { standardErrors } from "../core/errors";

export const UserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["admin", "developer", "designer", "viewer"]),
  avatarUrl: z.string().url().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const userContracts = {
  me: defineRoute({
    method: "get",
    path: "/api/me",
    summary: "Get current authenticated user",
    description:
      "Returns profile information for the user identified by the authentication credentials.",
    tags: ["Authentication"],
    responses: {
      200: UserSchema,
      401: standardErrors[401],
      500: standardErrors[500],
    },
  }),
};
