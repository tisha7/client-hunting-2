"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";
import {
  calculateLeadScore,
  calculateLeadPriority,
} from "@/lib/lead-scoring";

type Lead = {
  company_name: string;
  website?: string | null;
  country?: string | null;
  city?: string | null;
  niche?: string | null;
  business_type?: string | null;
  service?: string | null;
  landing_page?: string | null;
  main_problem?: string | null;
  decision_maker?: string | null;
  owner_email?: string | null;
  phone?: string | null;
  social_media?: string | null;
  owner_linkedin?: string | null;
  company_linkedin?: string | null;
  company_email?: string | null;
  screenshot_url?: string | null;
  lead_score: number;
  priority: string;
  status: string;
  research_notes?: string | null;
};

function normalizeKey(key: string) {
  return key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function getValue(
  row: Record<string, string>,
  keys: string[]
) {
  for (const key of keys) {
    const value = row[key];

    if (value !== undefined && value !== null) {
      const cleaned = String(value).trim();

      if (cleaned) return cleaned;
    }
  }

  return "";
}

export default function ImportLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setFileName(file.name);
    setMessage("");

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        const parsedLeads: Lead[] = results.data
          .map((rawRow): Lead | null => {
            const row: Record<string, string> = {};

            Object.entries(rawRow).forEach(([key, value]) => {
              row[normalizeKey(key)] =
                value === null || value === undefined
                  ? ""
                  : String(value).trim();
            });

            const companyName = getValue(row, [
              "company_name",
              "company",
              "business_name",
              "name",
            ]);

            if (!companyName) return null;

            const importedLead: Omit<Lead, "priority"> = {
              company_name: companyName,

              city: getValue(row, [
                "city",
                "location",
                "area",
              ]) || null,

              country: getValue(row, [
                "country",
              ]) || null,

              website: getValue(row, [
                "website",
                "url",
                "web",
              ]) || null,

              niche: getValue(row, [
                "niche",
                "industry",
                "category",
              ]) || "Cleaning Service",

              business_type: getValue(row, [
                "business_type",
                "type",
              ]) || null,

              service: getValue(row, [
                "service",
                "service_offer",
                "offer",
              ]) || null,

              landing_page: getValue(row, [
                "landing_page",
                "landingpage",
                "page",
              ]) || null,

              main_problem: getValue(row, [
                "main_problem",
                "problem",
                "issue",
              ]) || null,

              decision_maker: getValue(row, [
                "owner",
                "decision_maker",
                "contact_name",
              ]) || null,

              owner_email: getValue(row, [
                "owner_email",
                "decision_maker_email",
              ]) || null,

              phone: getValue(row, [
                "phone",
                "phone_number",
                "telephone",
              ]) || null,

              social_media: getValue(row, [
                "other_social_media_link",
                "social_media",
                "social",
              ]) || null,

              owner_linkedin: getValue(row, [
                "owner_linkedin",
                "owner_linkedin_url",
                "decision_maker_linkedin",
              ]) || null,

              company_linkedin: getValue(row, [
                "company_linkedin",
                "company_linkedin_url",
              ]) || null,

              company_email: getValue(row, [
                "company_email",
                "email",
                "business_email",
              ]) || null,

              screenshot_url: getValue(row, [
                "screenshot",
                "screenshot_url",
                "image",
              ]) || null,

              lead_score: calculateLeadScore({
                website: getValue(row, ["website", "url", "web"]) || null,
                landing_page: getValue(row, [
                  "landing_page",
                  "landingpage",
                  "page",
                ]) || null,
                decision_maker: getValue(row, [
                  "owner",
                  "decision_maker",
                  "contact_name",
                ]) || null,
                owner_email: getValue(row, [
                  "owner_email",
                  "decision_maker_email",
                ]) || null,
                phone: getValue(row, [
                  "phone",
                  "phone_number",
                  "telephone",
                ]) || null,
                social_media: getValue(row, [
                  "other_social_media_link",
                  "social_media",
                  "social",
                ]) || null,
                owner_linkedin: getValue(row, [
                  "owner_linkedin",
                  "owner_linkedin_url",
                  "decision_maker_linkedin",
                ]) || null,
                company_linkedin: getValue(row, [
                  "company_linkedin",
                  "company_linkedin_url",
                ]) || null,
                company_email: getValue(row, [
                  "company_email",
                  "email",
                  "business_email",
                ]) || null,
                main_problem: getValue(row, [
                  "main_problem",
                  "problem",
                  "issue",
                ]) || null,
                service: getValue(row, [
                  "service",
                  "service_offer",
                  "offer",
                ]) || null,
                research_notes: getValue(row, [
                  "research_notes",
                  "notes",
                  "note",
                  "description",
                ]) || null,
              }),

              status:
                getValue(row, ["status"]) ||
                "New",

              research_notes: getValue(row, [
                "research_notes",
                "notes",
                "note",
                "description",
              ]) || null,
            };

            return {
              ...importedLead,
              priority: calculateLeadPriority(importedLead.lead_score),
            };
          })
          .filter(
            (lead): lead is Lead => lead !== null
          );

        setLeads(parsedLeads);

        if (results.errors.length > 0) {
          setMessage(
            `${parsedLeads.length} leads ready. Some CSV rows may have parsing issues.`
          );
        } else {
          setMessage(
            `${parsedLeads.length} leads ready to import.`
          );
        }
      },

      error: () => {
        setMessage(
          "Failed to read the CSV file."
        );
      },
    });
  }

  async function handleImport() {
    if (leads.length === 0) {
      setMessage(
        "Please select a valid CSV file first."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("leads")
      .insert(leads);

    if (error) {
      console.error(error);

      setMessage(
        `Import failed: ${error.message}`
      );

      setLoading(false);
      return;
    }

    setMessage(
      `Successfully imported ${leads.length} leads!`
    );

    setLoading(false);
    setLeads([]);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl p-6 md:p-10">

        <Link
          href="/leads"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Leads
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold">
            📥 Import Leads from CSV
          </h1>

          <p className="mt-2 text-slate-400">
            Upload a CSV file with your researched lead data.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <label className="block text-sm font-medium">
            Select CSV File
          </label>

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="mt-4 block w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm"
          />

          {fileName && (
            <p className="mt-4 text-sm text-slate-400">
              Selected: {fileName}
            </p>
          )}

          {message && (
            <p className="mt-4 text-sm text-blue-400">
              {message}
            </p>
          )}
        </div>

        {leads.length > 0 && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 p-6">
              <h2 className="text-xl font-semibold">
                Preview Leads
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Showing first 10 of {leads.length} leads.
              </p>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px] text-left text-sm">

                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-4 py-4">Company</th>
                    <th className="px-4 py-4">City</th>
                    <th className="px-4 py-4">Website</th>
                    <th className="px-4 py-4">Service</th>
                    <th className="px-4 py-4">Owner</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Score</th>
                    <th className="px-4 py-4">Priority</th>
                  </tr>
                </thead>

                <tbody>
                  {leads
                    .slice(0, 10)
                    .map((lead, index) => (
                      <tr
                        key={`${lead.company_name}-${index}`}
                        className="border-b border-slate-800 last:border-0"
                      >

                        <td className="px-4 py-4 font-medium">
                          {lead.company_name}
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {lead.city || "-"}
                        </td>

                        <td className="px-4 py-4">
                          {lead.website ? (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              Visit
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {lead.service || "-"}
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {lead.decision_maker || "-"}
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {lead.owner_email ||
                            lead.company_email ||
                            "-"}
                        </td>

                        <td className="px-4 py-4">
                          🔥 {lead.lead_score}
                        </td>

                        <td className="px-4 py-4">
                          {lead.priority}
                        </td>

                      </tr>
                    ))}
                </tbody>

              </table>

            </div>

            <div className="flex justify-end border-t border-slate-800 p-6">

              <button
                type="button"
                onClick={handleImport}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Importing..."
                  : `Import ${leads.length} Leads`}
              </button>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
