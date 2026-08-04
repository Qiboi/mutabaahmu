export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];
