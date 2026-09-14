import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPriority(score: number) {
  if (score >= 17) {
    return {
      label: "🔥 Hot",
      className:
        "border-red-500/20 bg-red-500/10 text-red-400",
    };
  }

  if (score >= 13) {
    return {
      label: "🟡 Warm",
      className:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    };
  }

  return {
    label: "🔵 Low",
    className:
      "border-blue-500/20 bg-blue-500/10 text-blue-400",
  };
}

export default async function Home() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  const leads = data || [];

  const today = getDateOnly(new Date());

  const followUps = leads.filter(
    (lead) => lead.follow_up_date
  );

  const overdue = followUps.filter(
    (lead) =>
      lead.follow_up_date &&
      lead.follow_up_date < today
  );

  const todayFollowUps = followUps.filter(
    (lead) =>
      lead.follow_up_date === today
  );

  const upcoming = followUps.filter(
    (lead) =>
      lead.follow_up_date &&
      lead.follow_up_date > today
  );

  const hotLeads = leads.filter(
    (lead) =>
      Number(lead.lead_score) >= 17
  );

  const recentLeads = leads.slice(0, 5);

  const topHotLeads = [...hotLeads]
    .sort(
      (a, b) =>
        Number(b.lead_score || 0) -
        Number(a.lead_score || 0)
    )
    .slice(0, 5);

  const statuses = [
    "New",
    "Contacted",
    "Replied",
    "Interested",
    "Proposal Sent",
    "Won",
  ];

  const statusCounts = statuses.map(
    (status) => ({
      status,
      count: leads.filter(
        (lead) =>
          (lead.status || "New") === status
      ).length,
    })
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl p-6 md:p-10">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-blue-400">
              CLIENT HUNTING DASHBOARD
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Welcome back 👋
            </h1>

            <p className="mt-2 text-slate-400">
              Track your leads, pipeline, and follow-ups
              in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/leads/import"
              className="rounded-lg border border-slate-700 px-5 py-3 font-medium transition hover:bg-slate-800"
            >
              📥 Import CSV
            </Link>

            <Link
              href="/leads/new"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
            >
              + Add New Lead
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
            Error loading dashboard: {error.message}
          </div>
        )}

        {/* Stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <Link
            href="/leads"
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500/50 hover:bg-slate-800"
          >
            <p className="text-sm text-slate-400">
              Total Leads
            </p>

            <p className="mt-2 text-3xl font-bold">
              {leads.length}
            </p>

            <p className="mt-2 text-xs text-blue-400">
              View all →
            </p>
          </Link>

          <Link
            href="/follow-ups"
            className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 transition hover:bg-red-500/10"
          >
            <p className="text-sm text-red-400">
              🔴 Overdue
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {overdue.length}
            </p>

            <p className="mt-2 text-xs text-red-400">
              Needs attention →
            </p>
          </Link>

          <Link
            href="/follow-ups"
            className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 transition hover:bg-yellow-500/10"
          >
            <p className="text-sm text-yellow-400">
              🟡 Today
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {todayFollowUps.length}
            </p>

            <p className="mt-2 text-xs text-yellow-400">
              Follow-ups today →
            </p>
          </Link>

          <Link
            href="/follow-ups"
            className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 transition hover:bg-blue-500/10"
          >
            <p className="text-sm text-blue-400">
              📅 Upcoming
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {upcoming.length}
            </p>

            <p className="mt-2 text-xs text-blue-400">
              Scheduled →
            </p>
          </Link>

          <Link
            href="/leads"
            className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-6 transition hover:bg-orange-500/10"
          >
            <p className="text-sm text-orange-400">
              🔥 Hot Leads
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-400">
              {hotLeads.length}
            </p>

            <p className="mt-2 text-xs text-orange-400">
              High priority →
            </p>
          </Link>

        </section>

        {/* Follow-up Center */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                📅 Follow-up Center
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {overdue.length > 0
                  ? `You have ${overdue.length} overdue follow-up${
                      overdue.length === 1 ? "" : "s"
                    }.`
                  : todayFollowUps.length > 0
                    ? `You have ${todayFollowUps.length} follow-up${
                        todayFollowUps.length === 1
                          ? ""
                          : "s"
                      } scheduled for today.`
                    : upcoming.length > 0
                      ? `${upcoming.length} upcoming follow-up${
                          upcoming.length === 1
                            ? ""
                            : "s"
                        } scheduled.`
                      : "No follow-ups scheduled yet."}
              </p>
            </div>

            <Link
              href="/follow-ups"
              className="inline-flex w-fit rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
            >
              Open Follow-ups →
            </Link>

          </div>
        </section>

        {/* Pipeline Summary */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                📊 Pipeline Summary
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Overview of your current lead pipeline.
              </p>
            </div>

            <Link
              href="/pipeline"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View Pipeline →
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {statusCounts.map((item) => (
              <div
                key={item.status}
                className="rounded-lg border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    {item.status}
                  </p>

                  <p className="text-xl font-bold">
                    {item.count}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* Recent + Hot Leads */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Recent Leads */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  🆕 Recent Leads
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Latest leads added to your database.
                </p>
              </div>

              <Link
                href="/leads"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                View all →
              </Link>
            </div>

            <div className="mt-5 space-y-3">

              {recentLeads.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-700 p-5 text-center text-sm text-slate-400">
                  No leads added yet.
                </p>
              )}

              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-4 transition hover:border-blue-500/40 hover:bg-slate-800"
                >
                  <div>
                    <p className="font-medium">
                      {lead.company_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {lead.city ||
                        lead.country ||
                        lead.niche ||
                        "No location"}
                    </p>
                  </div>

                  <span className="text-sm text-slate-400">
                    {lead.status || "New"}
                  </span>
                </Link>
              ))}

            </div>
          </div>

          {/* Hot Leads */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  🔥 Top Hot Leads
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Highest scoring opportunities.
                </p>
              </div>

              <Link
                href="/leads"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                View all →
              </Link>
            </div>

            <div className="mt-5 space-y-3">

              {topHotLeads.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-700 p-5 text-center text-sm text-slate-400">
                  No hot leads yet.
                </p>
              )}

              {topHotLeads.map((lead) => {
                const score =
                  Number(lead.lead_score) || 0;

                const priority =
                  getPriority(score);

                return (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-4 transition hover:border-orange-500/40 hover:bg-slate-800"
                  >
                    <div>
                      <p className="font-medium">
                        {lead.company_name}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {lead.niche ||
                          lead.city ||
                          "Potential client"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-orange-400">
                        🔥 {score}
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full border px-2 py-1 text-xs ${priority.className}`}
                      >
                        {priority.label}
                      </span>
                    </div>
                  </Link>
                );
              })}

            </div>
          </div>

        </section>

        {/* Quick Actions */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">

          <Link
            href="/leads"
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500/40 hover:bg-slate-800"
          >
            <h2 className="text-lg font-semibold">
              👥 Manage Leads
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Search, filter, edit, and manage all your leads.
            </p>
          </Link>

          <Link
            href="/pipeline"
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500/40 hover:bg-slate-800"
          >
            <h2 className="text-lg font-semibold">
              📊 Pipeline
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              View leads grouped by their current pipeline stage.
            </p>
          </Link>

          <Link
            href="/follow-ups"
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500/40 hover:bg-slate-800"
          >
            <h2 className="text-lg font-semibold">
              📅 Follow-ups
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Stay on top of upcoming and overdue follow-ups.
            </p>
          </Link>

        </section>

      </div>
    </main>
  );
}
