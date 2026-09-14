"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: string;
  company_name: string;
  city: string | null;
  country: string | null;
  priority: string | null;
  status: string | null;
  follow_up_date: string | null;
};

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function getDateKey() {
  return new Date().toISOString().split("T")[0];
}

export default function FollowUpsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [completingId, setCompletingId] =
    useState<string | null>(null);

  async function loadFollowUps() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, company_name, city, country, priority, status, follow_up_date"
      )
      .not("follow_up_date", "is", null)
      .order("follow_up_date", {
        ascending: true,
      });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setLeads((data || []) as Lead[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadFollowUps();
  }, []);

  async function completeFollowUp(lead: Lead) {
    const confirmed = window.confirm(
      `Mark follow-up for "${lead.company_name}" as completed?`
    );

    if (!confirmed) return;

    setCompletingId(lead.id);
    setErrorMessage("");

    const { error: leadError } = await supabase
      .from("leads")
      .update({
        follow_up_date: null,
        status: "Contacted",
      })
      .eq("id", lead.id);

    if (leadError) {
      setErrorMessage(leadError.message);
      setCompletingId(null);
      return;
    }

    const { error: activityError } = await supabase
      .from("lead_activities")
      .insert({
        lead_id: lead.id,
        activity_type: "Follow-up Completed",
        note: "Follow-up marked as completed from Follow-ups page.",
      });

    if (activityError) {
      setErrorMessage(
        `Follow-up completed, but activity could not be added: ${activityError.message}`
      );
    }

    setLeads((current) =>
      current.filter((item) => item.id !== lead.id)
    );

    setCompletingId(null);
  }

  const grouped = useMemo(() => {
    const today = getDateKey();

    return {
      overdue: leads.filter(
        (lead) =>
          lead.follow_up_date &&
          lead.follow_up_date < today
      ),

      today: leads.filter(
        (lead) =>
          lead.follow_up_date === today
      ),

      upcoming: leads.filter(
        (lead) =>
          lead.follow_up_date &&
          lead.follow_up_date > today
      ),
    };
  }, [leads]);

  function FollowUpSection({
    title,
    icon,
    leads,
    emptyText,
    accent,
  }: {
    title: string;
    icon: string;
    leads: Lead[];
    emptyText: string;
    accent: string;
  }) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <h2 className="font-semibold">
              {icon} {title}
            </h2>

            <p className={`mt-1 text-sm ${accent}`}>
              {leads.length} lead
              {leads.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            {emptyText}
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    href={`/leads/${lead.id}`}
                    className="font-medium text-white hover:text-blue-400"
                  >
                    {lead.company_name}
                  </Link>

                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-400">
                    <span>
                      📍{" "}
                      {lead.city ||
                        lead.country ||
                        "Unknown location"}
                    </span>

                    {lead.follow_up_date && (
                      <span>
                        📅{" "}
                        {formatDate(
                          lead.follow_up_date
                        )}
                      </span>
                    )}

                    <span>
                      {lead.priority || "Low"} ·{" "}
                      {lead.status || "New"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    completeFollowUp(lead)
                  }
                  disabled={
                    completingId === lead.id
                  }
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {completingId === lead.id
                    ? "Completing..."
                    : "✓ Complete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl p-6 md:p-10">

        <Link
          href="/"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Dashboard
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold">
              📅 Follow-ups
            </h1>

            <p className="mt-2 text-slate-400">
              Track overdue, today's, and upcoming client follow-ups.
            </p>
          </div>

          <button
            type="button"
            onClick={loadFollowUps}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ↻ Refresh
          </button>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            Loading follow-ups...
          </div>
        ) : (
          <div className="mt-8 space-y-6">

            <FollowUpSection
              title="Overdue"
              icon="🔴"
              leads={grouped.overdue}
              emptyText="No overdue follow-ups. Great job!"
              accent="text-red-400"
            />

            <FollowUpSection
              title="Today"
              icon="🟡"
              leads={grouped.today}
              emptyText="No follow-ups scheduled for today."
              accent="text-yellow-400"
            />

            <FollowUpSection
              title="Upcoming"
              icon="🔵"
              leads={grouped.upcoming}
              emptyText="No upcoming follow-ups scheduled."
              accent="text-blue-400"
            />

          </div>
        )}

      </div>
    </main>
  );
}
