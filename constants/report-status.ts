export const REPORT_STATUS = ["draft", "submitted", "reviewed"] as const;
export type ReportStatus = (typeof REPORT_STATUS)[number];
