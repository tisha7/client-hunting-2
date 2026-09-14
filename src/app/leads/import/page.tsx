"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Lead = {
  company_name: string;
  website?: string;
  country?: string;
  city?: string;
  niche?: string;
  lead_score: number;
  priority: string;
  status: string;
  research_notes?: string;
};

function getPriority(score: number) {
  if (score >= 17) return "Hot";
  if (score >= 13) return "Warm";
  return "Low";
}

function getValue(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== "") {
      return row[key].trim();
    }
  }

  return "";
}

export default function ImportLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setFileName(file.name);
    setMessage("");

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;

      const lines = text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");

      if (lines.length < 2) {
        setMessage("CSV file does not contain enough data.");
        return;
      }

      const headers = lines[0]
        .split(",")
        .map((header) =>
          header
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_")
        );

      const parsedLeads: Lead[] = [];

      for (const line of lines.slice(1)) {
        const values = line.split(",");

        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || "";
        });

        const companyName = getValue(row, [
          "company_name",
          "company",
          "name",
          "business_name",
        ]);

        if (!companyName) continue;

        const scoreValue = getValue(row, [
          "lead_score",
          "score",
        ]);

        const score = Number.parseInt(scoreValue, 10);

        const leadScore = Number.isNaN(score) ? 0 : score;

        parsedLeads.push({
          company_name: companyName,
          website: getValue(row, [
            "website",
            "url",
            "web",
          ]),
          country: getValue(row, [
            "country",
          ]),
          city: getValue(row, [
            "city",
            "location",
          ]),
          niche:
            getValue(row, [
              "niche",
              "industry",
              "category",
            ]) || "Cleaning Service",
          lead_score: leadScore,
          priority: getPriority(leadScore),
          status: "New",
          research_notes: getValue(row, [
            "research_notes",
            "notes",
            "note",
            "description",
          ]),
        });
      }

      setLeads(parsedLeads);

      setMessage(
        `${parsedLeads.length} leads ready to import.`
      );
    };

    reader.readAsText(file);
  }

  async function handleImport() {
    if (leads.length === 0) {
      setMessage("Please select a valid CSV file first.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("leads")
      .insert(leads);

    if (error) {
      console.error(error);
      setMessage(`Import failed: ${error.message}`);
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
            Upload a CSV file to add multiple leads at once.
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
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Company</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Niche</th>
                    <th className="px-5 py-4">Score</th>
                    <th className="px-5 py-4">Priority</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.slice(0, 10).map((lead, index) => (
                    <tr
                      key={`${lead.company_name}-${index}`}
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="px-5 py-4 font-medium">
                        {lead.company_name}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {lead.city || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {lead.niche || "-"}
                      </td>

                      <td className="px-5 py-4">
                        🔥 {lead.lead_score}
                      </td>

                      <td className="px-5 py-4">
                        {lead.priority}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6">
              <button
                onClick={handleImport}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
