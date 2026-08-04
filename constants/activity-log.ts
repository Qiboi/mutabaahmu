export const ACTIVITY_ACTIONS = [
  "create",
  "update",
  "delete",
  "login",
  "export",
  "promote_class",
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];
