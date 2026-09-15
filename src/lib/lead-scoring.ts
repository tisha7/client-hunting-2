export type LeadScoringInput = {
  website?: string | null;
  landing_page?: string | null;
  decision_maker?: string | null;
  owner_email?: string | null;
  phone?: string | null;
  social_media?: string | null;
  owner_linkedin?: string | null;
  company_linkedin?: string | null;
  company_email?: string | null;
  main_problem?: string | null;
  service?: string | null;
  research_notes?: string | null;
};

export function calculateLeadScore(lead: LeadScoringInput): number {
  let score = 0;

  if (lead.website?.trim()) score += 10;
  if (lead.landing_page?.trim()) score += 10;
  if (lead.decision_maker?.trim()) score += 15;
  if (lead.owner_email?.trim()) score += 15;
  if (lead.phone?.trim()) score += 5;
  if (lead.social_media?.trim()) score += 5;
  if (lead.owner_linkedin?.trim()) score += 10;
  if (lead.company_linkedin?.trim()) score += 5;
  if (lead.company_email?.trim()) score += 5;
  if (lead.main_problem?.trim()) score += 10;
  if (lead.service?.trim()) score += 5;
  if (lead.research_notes?.trim()) score += 5;

  return Math.min(score, 100);
}

export function calculateLeadPriority(
  score: number
): "Hot" | "Warm" | "Low" {
  if (score >= 80) return "Hot";
  if (score >= 50) return "Warm";
  return "Low";
}
