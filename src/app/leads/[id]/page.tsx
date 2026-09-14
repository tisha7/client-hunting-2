"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: string;
  company_name: string;
  website: string | null;
  country: string | null;
  city: string | null;
  niche: string | null;
  business_type: string | null;
  decision_maker: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  lead_score: number | null;
  priority: string | null;
  status: string | null;
  service_opportunity: string | null;
  research_notes: string | null;
  follow_up_date: string | null;
  created_at: string | null;
};

type Note = {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
};

type Activity = {
  id: string;
  lead_id: string;
  activity_type: string;
  note: string | null;
  created_at: string;
};

function getActivityIcon(type: string) {
  const normalized = type.toLowerCase();

  if (normalized === "called") return "📞";
  if (normalized === "email sent") return "📧";
  if (normalized === "message sent") return "💬";
  if (normalized === "follow-up") return "📅";
  if (normalized === "note") return "📝";

  return "⚡";
}

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editActivityType, setEditActivityType] = useState("");
  const [editActivityNote, setEditActivityNote] = useState("");
  const [savingActivityId, setSavingActivityId] = useState<string | null>(null);
  const [completingFollowUp, setCompletingFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState("");
  const [savingAIAnalysis, setSavingAIAnalysis] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpResult, setFollowUpResult] = useState<any>(null);
  const [followUpError, setFollowUpError] = useState("");
  const [followUpMessage, setFollowUpMessage] = useState("");

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [notesLoading, setNotesLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const [activityType, setActivityType] = useState("Called");
  const [note, setNote] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLead() {
      setLoading(true);

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error) {
        setErrorMessage(error.message);
      } else {
        setLead(data as Lead);
        setFollowUpDate(data.follow_up_date || "");
      }

      const { data: notesData, error: notesError } = await supabase
        .from("lead_notes")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (!notesError && notesData) {
        setNotes(notesData as Note[]);
      }

      setNotesLoading(false);

      setLoading(false);
    }

    async function loadActivities() {
      const { data, error } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", {
          ascending: false,
        });

      if (!error && data) {
        setActivities(data as Activity[]);
      }
    }

    if (leadId) {
      loadLead();
      loadActivities();
    }
  }, [leadId]);

  async function addActivity(event: FormEvent) {
    event.preventDefault();

    if (!note.trim()) {
      setErrorMessage("Please write a note before saving.");
      return;
    }

    setActivityLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("lead_activities")
      .insert({
        lead_id: leadId,
        activity_type: activityType,
        note: note.trim(),
      })
      .select()
      .single();

    if (error) {
      setErrorMessage(error.message);
      setActivityLoading(false);
      return;
    }

    if (data) {
      setActivities((current) => [
        data as Activity,
        ...current,
      ]);
    }

    setNote("");
    setActivityLoading(false);
  }

  function startEditActivity(activity: Activity) {
    setEditingActivityId(activity.id);
    setEditActivityType(activity.activity_type);
    setEditActivityNote(activity.note || "");
    setErrorMessage("");
  }

  function cancelEditActivity() {
    setEditingActivityId(null);
    setEditActivityType("");
    setEditActivityNote("");
  }

  async function saveEditActivity(activityId: string) {
    if (!editActivityNote.trim()) {
      setErrorMessage("Please write a note before saving.");
      return;
    }

    setSavingActivityId(activityId);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("lead_activities")
      .update({
        activity_type: editActivityType,
        note: editActivityNote.trim(),
      })
      .eq("id", activityId)
      .select()
      .single();

    if (error) {
      setErrorMessage(error.message);
      setSavingActivityId(null);
      return;
    }

    if (data) {
      setActivities((current) =>
        current.map((activity) =>
          activity.id === activityId
            ? (data as Activity)
            : activity
        )
      );
    }

    cancelEditActivity();
    setSavingActivityId(null);
  }

  async function deleteActivity(activityId: string) {
    const confirmed = window.confirm(
      "Delete this activity?"
    );

    if (!confirmed) return;

    setDeletingActivityId(activityId);
    setErrorMessage("");

    const { error } = await supabase
      .from("lead_activities")
      .delete()
      .eq("id", activityId);

    if (error) {
      setErrorMessage(error.message);
      setDeletingActivityId(null);
      return;
    }

    setActivities((current) =>
      current.filter(
        (activity) => activity.id !== activityId
      )
    );

    setDeletingActivityId(null);
  }

  async function addNote() {
    if (!newNote.trim() || !lead) return;

    setSavingNote(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("lead_notes")
      .insert({
        lead_id: leadId,
        content: newNote.trim(),
      })
      .select()
      .single();

    if (error) {
      setErrorMessage(error.message);
      setSavingNote(false);
      return;
    }

    if (data) {
      setNotes((current) => [data as Note, ...current]);
    }

    setNewNote("");
    setSavingNote(false);
  }

  async function deleteNote(noteId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    setDeletingNoteId(noteId);
    setErrorMessage("");

    const { error } = await supabase
      .from("lead_notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      setErrorMessage(error.message);
      setDeletingNoteId(null);
      return;
    }

    setNotes((current) =>
      current.filter((note) => note.id !== noteId)
    );

    setDeletingNoteId(null);
  }

  async function saveFollowUpDate() {
    if (!lead) return;

    setSavingFollowUp(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("leads")
      .update({
        follow_up_date: followUpDate || null,
      })
      .eq("id", leadId);

    if (error) {
      setErrorMessage(error.message);
      setSavingFollowUp(false);
      return;
    }

    setLead({
      ...lead,
      follow_up_date: followUpDate || null,
    });

    setSavingFollowUp(false);
  }

  async function completeFollowUp() {
    if (!lead) return;

    setCompletingFollowUp(true);
    setErrorMessage("");

    const { error: leadError } = await supabase
      .from("leads")
      .update({
        follow_up_date: null,
        status: "Contacted",
      })
      .eq("id", leadId);

    if (leadError) {
      setErrorMessage(leadError.message);
      setCompletingFollowUp(false);
      return;
    }

    const { data: activityData, error: activityError } =
      await supabase
        .from("lead_activities")
        .insert({
          lead_id: leadId,
          activity_type: "Follow-up Completed",
          note: "Follow-up marked as completed.",
        })
        .select()
        .single();

    if (activityError) {
      setErrorMessage(activityError.message);
    } else if (activityData) {
      setActivities((current) => [
        activityData as Activity,
        ...current,
      ]);
    }

    setLead({
      ...lead,
      follow_up_date: null,
      status: "Contacted",
    });

    setFollowUpDate("");

    setCompletingFollowUp(false);
  }

  async function deleteLead() {
    const confirmed = window.confirm(
      `Delete "${lead?.company_name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", leadId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/leads");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <p className="text-slate-400">
          Loading lead...
        </p>
      </main>
    );
  }

  if (!lead) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <Link
          href="/leads"
          className="text-blue-400 hover:text-blue-300"
        >
          ← Back to Leads
        </Link>

        <p className="mt-6 text-red-400">
          Lead not found.
        </p>

        {errorMessage && (
          <p className="mt-3 text-sm text-red-400">
            {errorMessage}
          </p>
        )}
      </main>
    );
  }

  async function copyAIEmail() {
    if (!aiResult?.email) return;

    try {
      await navigator.clipboard.writeText(aiResult.email);
      setAiMessage("Cold email copied successfully.");
    } catch {
      setAiMessage("Failed to copy the cold email.");
    }
  }

  async function saveAIAnalysis() {
    if (!lead || !aiResult) return;

    setSavingAIAnalysis(true);
    setAiMessage("");

    const content = `AI Lead Analysis

Lead Analysis:
${aiResult.leadAnalysis || ""}

Why This Client Is Valuable:
${aiResult.value || ""}

Recommended Service Offer:
${aiResult.service || ""}

Outreach Strategy:
${aiResult.strategy || ""}

Cold Email:
${aiResult.email || ""}

Recommended Next Action:
${aiResult.nextAction || ""}`;

    const { data, error } = await supabase
      .from("lead_notes")
      .insert({
        lead_id: leadId,
        content,
      })
      .select()
      .single();

    if (error) {
      setAiMessage(error.message);
      setSavingAIAnalysis(false);
      return;
    }

    if (data) {
      setNotes((current) => [
        data as Note,
        ...current,
      ]);
    }

    setAiMessage("AI analysis saved to Quick Notes.");
    setSavingAIAnalysis(false);
  }

  async function generateFollowUpAI() {
    if (!lead) return;

    setFollowUpLoading(true);
    setFollowUpError("");
    setFollowUpMessage("");
    setFollowUpResult(null);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "follow_up",
          lead,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate follow-up."
        );
      }

      setFollowUpResult(data);
    } catch (error) {
      setFollowUpError(
        error instanceof Error
          ? error.message
          : "Failed to generate follow-up."
      );
    } finally {
      setFollowUpLoading(false);
    }
  }

  async function copyFollowUpEmail() {
    if (!followUpResult?.email) return;

    try {
      const subject = followUpResult.subject
        ? `Subject: ${followUpResult.subject}\n\n`
        : "";

      await navigator.clipboard.writeText(
        subject + followUpResult.email
      );

      setFollowUpMessage("Follow-up email copied.");
    } catch {
      setFollowUpMessage("Failed to copy follow-up email.");
    }
  }

  async function copyFollowUpMessage() {
    if (!followUpResult?.message) return;

    try {
      await navigator.clipboard.writeText(
        followUpResult.message
      );

      setFollowUpMessage("Follow-up message copied.");
    } catch {
      setFollowUpMessage("Failed to copy follow-up message.");
    }
  }

  async function analyzeWithAI() {
    if (!lead) return;

    setAiLoading(true);
    setAiError("");
    setAiMessage("");
    setAiResult(null);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: lead.company_name,
          website: lead.website,
          niche: lead.niche,
          city: lead.city,
          country: lead.country,
          lead_score: lead.lead_score,
          priority: lead.priority,
          status: lead.status,
          service_opportunity: lead.service_opportunity,
          research_notes: lead.research_notes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to analyze lead."
        );
      }

      setAiResult(data.analysis);
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "Failed to analyze lead."
      );
    } finally {
      setAiLoading(false);
    }
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

        <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-start">

          <div>
            <h1 className="text-3xl font-bold">
              {lead.company_name}
            </h1>

            <p className="mt-2 text-slate-400">
              {lead.city || lead.country || "Location not available"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <Link
              href={`/leads/${lead.id}/edit`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
            >
              ✏️ Edit Lead
            </Link>

            {lead.follow_up_date && (
              <button
                type="button"
                onClick={completeFollowUp}
                disabled={completingFollowUp}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {completingFollowUp
                  ? "Completing..."
                  : "✓ Complete Follow-up"}
              </button>
            )}

            <button
              onClick={deleteLead}
              className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
            >
              🗑 Delete
            </button>

          </div>

        </div>

        {errorMessage && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* Lead Information */}
          <section className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-bold">
              Lead Information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <Info label="Website" value={lead.website} link />

              <Info label="Country" value={lead.country} />

              <Info label="City" value={lead.city} />

              <Info label="Niche" value={lead.niche} />

              <Info
                label="Business Type"
                value={lead.business_type}
              />

              <Info
                label="Decision Maker"
                value={lead.decision_maker}
              />

              <Info label="Role" value={lead.role} />

              <Info
                label="Email"
                value={lead.email}
                email
              />

              <Info
                label="Phone"
                value={lead.phone}
              />

              <Info
                label="Follow-up Date"
                value={lead.follow_up_date}
              />

            </div>

          </section>

          {/* Lead Score */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-bold">
              Lead Score
            </h2>

            <p className="mt-6 text-5xl font-bold text-orange-400">
              🔥 {lead.lead_score || 0}
            </p>

            <div className="mt-6 space-y-4 text-sm">

              <div>
                <p className="text-slate-400">
                  Priority
                </p>

                <p className="mt-1 font-medium">
                  {lead.priority || "Low"}
                </p>
              </div>

              <div>
                <p className="text-slate-400">
                  Status
                </p>

                <p className="mt-1 font-medium text-emerald-400">
                  {lead.status || "New"}
                </p>
              </div>

            </div>

          </section>

        </div>

        {/* Opportunity */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-bold">
            Service Opportunity
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-slate-300">
            {lead.service_opportunity ||
              "No service opportunity added yet."}
          </p>

        </section>

        {/* Research Notes */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-bold">
            Research Notes
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-slate-300">
            {lead.research_notes ||
              "No research notes added yet."}
          </p>

        </section>

        {/* Add Activity */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-bold">
            ⚡ Add Activity
          </h2>

          <form
            onSubmit={addActivity}
            className="mt-5"
          >

            <div className="grid gap-4 md:grid-cols-3">

              <select
                value={activityType}
                onChange={(event) =>
                  setActivityType(event.target.value)
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option>Called</option>
                <option>Email Sent</option>
                <option>Message Sent</option>
                <option>Follow-up</option>
                <option>Note</option>
              </select>

              <textarea
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                placeholder="What happened?"
                rows={3}
                className="md:col-span-2 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>

            <button
              type="submit"
              disabled={activityLoading}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {activityLoading
                ? "Saving..."
                : "Save Activity"}
            </button>

          </form>

        </section>

        {/* Follow-up Schedule */}
        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                📅 Follow-up Schedule
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Set or reschedule your next follow-up for this lead.
              </p>

              <input
                type="date"
                value={followUpDate}
                onChange={(event) =>
                  setFollowUpDate(event.target.value)
                }
                className="mt-4 w-full max-w-sm rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveFollowUpDate}
                disabled={savingFollowUp}
                className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingFollowUp
                  ? "Saving..."
                  : lead.follow_up_date
                    ? "🔄 Reschedule"
                    : "📅 Set Follow-up"}
              </button>

              {followUpDate && (
                <button
                  type="button"
                  onClick={() => setFollowUpDate("")}
                  className="rounded-lg border border-slate-700 px-4 py-3 text-sm hover:bg-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

          </div>

          {lead.follow_up_date && (
            <p className="mt-4 text-sm text-emerald-400">
              Next follow-up scheduled for:{" "}
              {new Date(
                lead.follow_up_date + "T00:00:00"
              ).toLocaleDateString()}
            </p>
          )}
        </section>

        {/* Quick Notes */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <h2 className="text-xl font-bold">
              📝 Quick Notes
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Add important notes about this lead.
            </p>
          </div>

          <div className="mt-5">
            <textarea
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              placeholder="Write a note..."
              rows={4}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={addNote}
                disabled={!newNote.trim() || savingNote}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingNote ? "Saving..." : "💾 Add Note"}
              </button>
            </div>
          </div>

          <div className="mt-6">
            {notesLoading ? (
              <p className="text-sm text-slate-400">
                Loading notes...
              </p>
            ) : notes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-700 p-5 text-sm text-slate-400">
                No notes added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="whitespace-pre-wrap text-sm text-slate-200">
                        {note.content}
                      </p>

                      <button
                        type="button"
                        onClick={() => deleteNote(note.id)}
                        disabled={deletingNoteId === note.id}
                        className="shrink-0 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        {deletingNoteId === note.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      {new Date(
                        note.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* AI Lead Assistant */}
        <section className="mt-6 rounded-xl border border-purple-500/20 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                🤖 AI Lead Assistant
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Get AI-powered insights and outreach ideas for this lead.
              </p>
            </div>

            <button
              type="button"
              onClick={analyzeWithAI}
              disabled={aiLoading}
              className="rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading
                ? "Analyzing..."
                : "✨ Analyze Lead"}
            </button>
          </div>

          {aiError && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {aiError}
            </div>
          )}

          {aiResult && (
            <div className="mt-6">
              <div className="mb-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyAIEmail}
                  className="rounded-lg border border-purple-500/30 px-4 py-2 text-sm font-medium text-purple-300 hover:bg-purple-500/10"
                >
                  📋 Copy Cold Email
                </button>

                <button
                  type="button"
                  onClick={saveAIAnalysis}
                  disabled={savingAIAnalysis}
                  className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingAIAnalysis
                    ? "Saving..."
                    : "💾 Save AI Analysis"}
                </button>

                <button
                  type="button"
                  onClick={analyzeWithAI}
                  disabled={aiLoading}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  🔄 Regenerate
                </button>
              </div>

              {aiMessage && (
                <p className="mb-4 text-sm text-emerald-400">
                  {aiMessage}
                </p>
              )}

              <div className="grid gap-4">
              <AISection
                title="🔍 Lead Analysis"
                content={aiResult.leadAnalysis}
              />

              <AISection
                title="💎 Why This Client Is Valuable"
                content={aiResult.value}
              />

              <AISection
                title="🎯 Recommended Service Offer"
                content={aiResult.service}
              />

              <AISection
                title="📨 Outreach Strategy"
                content={aiResult.strategy}
              />

              <AISection
                title="✉️ Cold Email Example"
                content={aiResult.email}
              />

              <AISection
                title="➡️ Recommended Next Action"
                content={aiResult.nextAction}
              />
              </div>
            </div>
          )}
        </section>

        {/* AI Follow-up Generator */}
        <section className="mt-6 rounded-xl border border-blue-500/20 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                ✉️ AI Follow-up Generator
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Generate a personalized follow-up email and short message.
              </p>
            </div>

            <button
              type="button"
              onClick={generateFollowUpAI}
              disabled={followUpLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {followUpLoading
                ? "Generating..."
                : "✨ Generate Follow-up"}
            </button>
          </div>

          {followUpError && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {followUpError}
            </div>
          )}

          {followUpResult && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyFollowUpEmail}
                  className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/10"
                >
                  📋 Copy Email
                </button>

                <button
                  type="button"
                  onClick={copyFollowUpMessage}
                  className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/10"
                >
                  📋 Copy Message
                </button>

                <button
                  type="button"
                  onClick={generateFollowUpAI}
                  disabled={followUpLoading}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  🔄 Regenerate
                </button>
              </div>

              {followUpMessage && (
                <p className="text-sm text-emerald-400">
                  {followUpMessage}
                </p>
              )}

              {followUpResult.subject && (
                <AISection
                  title="📌 Follow-up Email Subject"
                  content={followUpResult.subject}
                />
              )}

              <AISection
                title="✉️ Follow-up Email"
                content={followUpResult.email || ""}
              />

              <AISection
                title="💬 Short Follow-up Message"
                content={followUpResult.message || ""}
              />
            </div>
          )}
        </section>

        {/* Activity Timeline */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                📜 Activity Timeline
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                History of interactions with this lead.
              </p>
            </div>

            <span className="text-sm text-slate-400">
              {activities.length} activities
            </span>
          </div>

          {activities.length === 0 && (
            <p className="mt-6 rounded-lg border border-dashed border-slate-700 p-6 text-sm text-slate-400">
              No activities yet. Add your first activity above.
            </p>
          )}

          <div className="mt-6 space-y-4">

            {activities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-lg border border-slate-800 bg-slate-950/50 p-5"
              >

                {editingActivityId === activity.id ? (
                  <div className="space-y-4">

                    <select
                      value={editActivityType}
                      onChange={(event) =>
                        setEditActivityType(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                    >
                      <option>Called</option>
                      <option>Email Sent</option>
                      <option>Message Sent</option>
                      <option>Follow-up</option>
                      <option>Note</option>
                    </select>

                    <textarea
                      value={editActivityNote}
                      onChange={(event) =>
                        setEditActivityNote(event.target.value)
                      }
                      rows={4}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          saveEditActivity(activity.id)
                        }
                        disabled={
                          savingActivityId === activity.id
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                      >
                        {savingActivityId === activity.id
                          ? "Saving..."
                          : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditActivity}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                    </div>

                  </div>
                ) : (
                  <>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                      <p className="font-medium">
                        {getActivityIcon(activity.activity_type)}{" "}
                        {activity.activity_type}
                      </p>

                      <div className="flex items-center gap-3">
                        <p className="text-xs text-slate-500">
                          {new Date(
                            activity.created_at
                          ).toLocaleString()}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            startEditActivity(activity)
                          }
                          className="rounded-md border border-blue-500/30 px-3 py-1 text-xs text-blue-400 hover:bg-blue-500/10"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteActivity(activity.id)
                          }
                          disabled={
                            deletingActivityId === activity.id
                          }
                          className="rounded-md border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingActivityId === activity.id
                            ? "Deleting..."
                            : "🗑 Delete"}
                        </button>
                      </div>

                    </div>

                    {activity.note && (
                      <p className="mt-4 whitespace-pre-wrap text-sm text-slate-300">
                        {activity.note}
                      </p>
                    )}
                  </>
                )}

              </div>
            ))}

          </div>

        </section>

      </div>
    </main>
  );
}

function Info({
  label,
  value,
  link = false,
  email = false,
}: {
  label: string;
  value: string | null;
  link?: boolean;
  email?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-slate-400">
        {label}
      </p>

      {!value && (
        <p className="mt-1 text-slate-500">
          -
        </p>
      )}

      {value && link && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block text-blue-400 hover:underline"
        >
          {value}
        </a>
      )}

      {value && email && (
        <a
          href={`mailto:${value}`}
          className="mt-1 block text-blue-400 hover:underline"
        >
          {value}
        </a>
      )}

      {value && !link && !email && (
        <p className="mt-1 text-slate-200">
          {value}
        </p>
      )}
    </div>
  );
}


function AISection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <h3 className="font-semibold text-purple-300">
        {title}
      </h3>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
        {content}
      </p>
    </div>
  );
}
