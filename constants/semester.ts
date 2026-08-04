export const SEMESTERS = ["ganjil", "genap"] as const;
export type Semester = (typeof SEMESTERS)[number];
