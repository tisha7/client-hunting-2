"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: string;
  company_name: string;
  website: string | null;
  country: string | null;
  city: string | null;
  niche: string | null;
  lead_score: number | null;
  priority: string | null;
  status: string | null;
  created_at?: string | null;
};

function getPriority(score: number) {
  if (score >= 17) {
    return {
      label: "Hot",
      className: "bg-red-500/10 text-red-400 border-red-500/20",
    };
  }

  if (score >= 13) {
    return {
      label: "Warm",
      className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    };
  }

  return {
    label: "Low",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeads() {
      setLoading(true);

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setLeads([]);
      } else {
        setLeads((data || []) as Lead[]);
      }

      setLoading(false);
    }

    loadLeads();
  }, []);

  const locations = useMemo(() => {
    return Array.from(
      new Set(
        leads
          .map((lead) => lead.city || lead.country)
          .filter((value): value is string => Boolean(value))
      )
    ).sort();
  }, [leads]);

  const statuses = useMemo(() => {
    return Array.from(
      new Set(
        leads
          .map((lead) => lead.status || "New")
          .filter(Boolean)
      )
    ).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((lead) =>
        [
          lead.company_name,
          lead.website,
          lead.city,
          lead.country,
          lead.niche,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          )
      );
    }

    if (locationFilter !== "all") {
      result = result.filter(
        (lead) =>
          lead.city === locationFilter ||
          lead.country === locationFilter
      );
    }

    if (priorityFilter !== "all") {
      result = result.filter((lead) => {
        const score = Number(lead.lead_score) || 0;
        const priority = getPriority(score).label;

        return priority === priorityFilter;
      });
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (lead) => (lead.status || "New") === statusFilter
      );
    }

    if (sortBy === "score-high") {
      result.sort(
        (a, b) =>
          (Number(b.lead_score) || 0) -
          (Number(a.lead_score) || 0)
      );
    }

    if (sortBy === "score-low") {
      result.sort(
        (a, b) =>
          (Number(a.lead_score) || 0) -
          (Number(b.lead_score) || 0)
      );
    }

    if (sortBy === "company") {
      result.sort((a, b) =>
        a.company_name.localeCompare(b.company_name)
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }

    return result;
  }, [
    leads,
    search,
    locationFilter,
    priorityFilter,
    statusFilter,
    sortBy,
  ]);

  async function deleteLead(id: string, companyName: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${companyName}"?`
    );

    if (!confirmed) return;

    setDeletingId(id);

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      alert(`Failed to delete lead: ${error.message}`);
      setDeletingId(null);
      return;
    }

    setLeads((currentLeads) =>
      currentLeads.filter((lead) => lead.id !== id)
    );

    setDeletingId(null);
  }

  function clearFilters() {
    setSearch("");
    setLocationFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl p-6 md:p-10">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <Link
              href="/"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              ← Dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold">
              👥 Leads
            </h1>

            <p className="mt-2 text-slate-400">
              Search, filter and manage your potential clients.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/leads/import"
              className="rounded-lg border border-slate-700 px-5 py-3 font-medium hover:bg-slate-800"
            >
              📥 Import CSV
            </Link>

            <Link
              href="/leads/new"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
            >
              + Add New Lead
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="🔎 Search company..."
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={locationFilter}
              onChange={(event) =>
                setLocationFilter(event.target.value)
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="all">All Locations</option>

              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="Hot">🔥 Hot</option>
              <option value="Warm">🟡 Warm</option>
              <option value="Low">🔵 Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="score-high">Highest Score</option>
              <option value="score-low">Lowest Score</option>
              <option value="company">Company A-Z</option>
            </select>

          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {filteredLeads.length} of {leads.length} leads
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 p-6">
            <div>
              <h2 className="font-semibold">
                All Leads
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {leads.length} leads in your database
              </p>
            </div>
          </div>

          {loading && (
            <div className="p-10 text-center text-slate-400">
              Loading leads...
            </div>
          )}

          {errorMessage && (
            <div className="p-6 text-red-400">
              Error loading leads: {errorMessage}
            </div>
          )}

          {!loading &&
            !errorMessage &&
            leads.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-slate-400">
                  No leads found yet.
                </p>

                <Link
                  href="/leads/import"
                  className="mt-4 inline-block text-blue-400"
                >
                  Import your first CSV →
                </Link>
              </div>
            )}

          {!loading &&
            !errorMessage &&
            leads.length > 0 &&
            filteredLeads.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-slate-400">
                  No leads match your filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-blue-400"
                >
                  Clear filters
                </button>
              </div>
            )}

          {!loading &&
            filteredLeads.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="px-5 py-4">Company</th>
                      <th className="px-5 py-4">Location</th>
                      <th className="px-5 py-4">Niche</th>
                      <th className="px-5 py-4">Score</th>
                      <th className="px-5 py-4">Priority</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeads.map((lead) => {
                      const score =
                        Number(lead.lead_score) || 0;

                      const priority =
                        getPriority(score);

                      return (
                        <tr
                          key={lead.id}
                          className="border-b border-slate-800 transition hover:bg-slate-800/50 last:border-0"
                        >
                          <td className="px-5 py-4">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="font-medium text-white hover:text-blue-400"
                            >
                              {lead.company_name}
                            </Link>

                            {lead.website && (
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 block text-xs text-blue-400 hover:underline"
                              >
                                Visit website ↗
                              </a>
                            )}
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {lead.city ||
                              lead.country ||
                              "-"}
                          </td>

                          <td className="px-5 py-4 text-slate-400">
                            {lead.niche ||
                              "Cleaning Service"}
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-semibold text-orange-400">
                              🔥 {score}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${priority.className}`}
                            >
                              {priority.label}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                              {lead.status || "New"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Link
                                href={`/leads/${lead.id}`}
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                View
                              </Link>

                              <Link
                                href={`/leads/${lead.id}/edit`}
                                className="text-xs text-yellow-400 hover:text-yellow-300"
                              >
                                Edit
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteLead(
                                    lead.id,
                                    lead.company_name
                                  )
                                }
                                disabled={deletingId === lead.id}
                                className="text-xs text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === lead.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            )}

        </div>
      </div>
    </main>
  );
}
