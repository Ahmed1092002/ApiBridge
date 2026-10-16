export * from "./core/contract";
export * from "./core/errors";
export * from "./schemas/user";
export * from "./schemas/task";

import { userContracts } from "./schemas/user";
import { taskContracts } from "./schemas/task";

/**
 * Root contract tree grouping all domain contracts.
 */
export const apiContract = {
  me: userContracts.me,
  tasks: taskContracts,
} as const;

export type ApiContract = typeof apiContract;
