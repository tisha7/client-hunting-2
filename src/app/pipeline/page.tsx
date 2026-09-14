"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: string;
  company_name: string;
  niche: string | null;
  priority: string | null;
  status: string | null;
  lead_score: number | null;
};

const columns = [
  "New",
  "Contacted",
  "Follow-up",
  "Interested",
  "Client Won",
  "Lost",
];

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("lead_score", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setLeads(data || []);
    }

    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);

    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Failed to update lead status.");
      console.error(error);
    } else {
      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === id
            ? { ...lead, status }
            : lead
        )
      );
    }

    setUpdatingId(null);
  }

  function getPriorityClass(priority: string | null) {
    const value = priority?.toLowerCase();

    if (value === "hot") {
      return "bg-red-500/10 text-red-400";
    }

    if (value === "warm") {
      return "bg-orange-500/10 text-orange-400";
    }

    return "bg-blue-500/10 text-blue-400";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Loading pipeline...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="p-6 md:p-10">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-400">
              Client Acquisition Workspace
            </p>

            <h1 className="text-3xl font-bold">
              📊 Pipeline
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Track and manage your leads through the sales process.
            </p>
          </div>

          <Link
            href="/leads/new"
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
          >
            + Add New Lead
          </Link>
        </div>

        {/* Pipeline */}
        <div className="overflow-x-auto">
          <div className="grid min-w-[1200px] grid-cols-6 gap-4">

            {columns.map((column) => {
              const columnLeads = leads.filter(
                (lead) =>
                  (lead.status || "New").toLowerCase() ===
                  column.toLowerCase()
              );

              return (
                <div
                  key={column}
                  className="rounded-xl border border-slate-800 bg-slate-900"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 p-4">
                    <h2 className="font-semibold">
                      {column}
                    </h2>

                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">
                      {columnLeads.length}
                    </span>
                  </div>

                  {/* Leads */}
                  <div className="space-y-3 p-3">

                    {columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                      >
                        <Link
                          href={`/leads/${lead.id}`}
                          className="block"
                        >
                          <h3 className="font-medium hover:text-blue-400">
                            {lead.company_name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {lead.niche || "No niche"}
                          </p>
                        </Link>

                        <div className="mt-4 flex items-center justify-between">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${getPriorityClass(
                              lead.priority
                            )}`}
                          >
                            {lead.priority || "Low"}
                          </span>

                          <span className="text-sm font-semibold text-orange-400">
                            🔥 {lead.lead_score ?? 0}
                          </span>
                        </div>

                        {/* Status Changer */}
                        <select
                          value={lead.status || "New"}
                          disabled={updatingId === lead.id}
                          onChange={(event) =>
                            updateStatus(
                              lead.id,
                              event.target.value
                            )
                          }
                          className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          {columns.map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>

                        {updatingId === lead.id && (
                          <p className="mt-2 text-xs text-blue-400">
                            Updating...
                          </p>
                        )}
                      </div>
                    ))}

                    {columnLeads.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-sm text-slate-500">
                        No leads
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8">
          <Link
            href="/leads"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Leads
          </Link>
        </div>

      </div>
    </main>
  );
}
