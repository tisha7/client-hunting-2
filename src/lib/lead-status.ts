export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Replied",
  "Interested",
  "Proposal Sent",
  "Won",
  "Lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function normalizeLeadStatus(status?: string | null): LeadStatus {
  const value = status?.trim().toLowerCase();

  if (value === "client won") return "Won";
  if (value === "qualified") return "Interested";
  if (value === "follow-up") return "Contacted";
  if (value === "closed") return "Lost";

  const match = LEAD_STATUSES.find(
    (item) => item.toLowerCase() === value
  );

  return match ?? "New";
}
