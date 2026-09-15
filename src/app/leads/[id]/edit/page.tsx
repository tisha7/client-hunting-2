"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  calculateLeadScore,
  calculateLeadPriority,
} from "@/lib/lead-scoring";

type LeadForm = {
  company_name: string;
  website: string;
  country: string;
  city: string;
  niche: string;
  business_type: string;
  service: string;
  landing_page: string;
  main_problem: string;
  decision_maker: string;
  owner_email: string;
  phone: string;
  social_media: string;
  owner_linkedin: string;
  company_linkedin: string;
  company_email: string;
  screenshot_url: string;
  lead_score: string;
  priority: string;
  status: string;
  follow_up_date: string;
  research_notes: string;
};

const emptyLead: LeadForm = {
  company_name: "",
  website: "",
  country: "",
  city: "",
  niche: "",
  business_type: "",
  service: "",
  landing_page: "",
  main_problem: "",
  decision_maker: "",
  owner_email: "",
  phone: "",
  social_media: "",
  owner_linkedin: "",
  company_linkedin: "",
  company_email: "",
  screenshot_url: "",
  lead_score: "0",
  priority: "Low",
  status: "New",
  follow_up_date: "",
  research_notes: "",
};

export default function EditLeadPage() {
  const params = useParams();
  const router = useRouter();

  const leadId = params.id as string;

  const [form, setForm] = useState<LeadForm>(emptyLead);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const liveScore = calculateLeadScore(form);
  const livePriority = calculateLeadPriority(liveScore);

  useEffect(() => {
    async function loadLead() {
      setLoading(true);

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error) {
        alert("Failed to load lead: " + error.message);
        setLoading(false);
        return;
      }

      setForm({
        company_name: data.company_name ?? "",
        website: data.website ?? "",
        country: data.country ?? "",
        city: data.city ?? "",
        niche: data.niche ?? "",
        business_type: data.business_type ?? "",
        service: data.service ?? "",
        landing_page: data.landing_page ?? "",
        main_problem: data.main_problem ?? "",
        decision_maker: data.decision_maker ?? "",
        owner_email: data.owner_email ?? "",
        phone: data.phone ?? "",
        social_media: data.social_media ?? "",
        owner_linkedin: data.owner_linkedin ?? "",
        company_linkedin: data.company_linkedin ?? "",
        company_email: data.company_email ?? "",
        screenshot_url: data.screenshot_url ?? "",
        lead_score: String(data.lead_score ?? 0),
        priority: data.priority ?? "Low",
        status: data.status ?? "New",
        follow_up_date: data.follow_up_date ?? "",
        research_notes: data.research_notes ?? "",
      });

      setLoading(false);
    }

    if (leadId) {
      loadLead();
    }
  }, [leadId]);

  function updateField(name: keyof LeadForm, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);

    const calculatedScore = calculateLeadScore(form);
    const calculatedPriority = calculateLeadPriority(calculatedScore);

    const { error } = await supabase
      .from("leads")
      .update({
        company_name: form.company_name,
        website: form.website || null,
        country: form.country || null,
        city: form.city || null,
        niche: form.niche || null,
        business_type: form.business_type || null,
        service: form.service || null,
        landing_page: form.landing_page || null,
        main_problem: form.main_problem || null,
        decision_maker: form.decision_maker || null,
        owner_email: form.owner_email || null,
        phone: form.phone || null,
        social_media: form.social_media || null,
        owner_linkedin: form.owner_linkedin || null,
        company_linkedin: form.company_linkedin || null,
        company_email: form.company_email || null,
        screenshot_url: form.screenshot_url || null,
        lead_score: calculatedScore,
        priority: calculatedPriority,
        status: form.status,
        follow_up_date: form.follow_up_date || null,
        research_notes: form.research_notes || null,
      })
      .eq("id", leadId);

    if (error) {
      alert("Failed to update lead: " + error.message);
      setSaving(false);
      return;
    }

    router.push(`/leads/${leadId}`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Loading lead...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl p-6 md:p-10">

        <Link
          href={`/leads/${leadId}`}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Lead Details
        </Link>

        <div className="mt-8">
          <p className="text-sm text-blue-400">
            Update Lead
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            ✏️ Edit Lead
          </h1>

          <p className="mt-2 text-slate-400">
            Update business, contact, research, and outreach information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 rounded-lg border border-slate-700 bg-slate-950 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Live Lead Score</p>
                  <p className="mt-1 text-2xl font-bold">{liveScore}/100</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Priority</p>
                  <p className="mt-1 text-lg font-semibold">
                    {livePriority === "Hot" && "🔥 "}
                    {livePriority === "Warm" && "🟡 "}
                    {livePriority === "Low" && "🔵 "}
                    {livePriority}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Score and priority update automatically as you edit lead data.
              </p>
            </div>

            <h2 className="text-lg font-semibold">
              🏢 Business Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <Input
                label="Company Name"
                value={form.company_name}
                onChange={(value) =>
                  updateField("company_name", value)
                }
                required
              />

              <Input
                label="Website"
                type="url"
                value={form.website}
                onChange={(value) =>
                  updateField("website", value)
                }
              />

              <Input
                label="Country"
                value={form.country}
                onChange={(value) =>
                  updateField("country", value)
                }
              />

              <Input
                label="City"
                value={form.city}
                onChange={(value) =>
                  updateField("city", value)
                }
              />

              <Input
                label="Niche"
                value={form.niche}
                onChange={(value) =>
                  updateField("niche", value)
                }
              />

              <Input
                label="Business Type"
                value={form.business_type}
                onChange={(value) =>
                  updateField("business_type", value)
                }
              />

            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              👤 Contact Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <Input
                label="Decision Maker"
                value={form.decision_maker}
                onChange={(value) =>
                  updateField("decision_maker", value)
                }
              />

              <Input
                label="Owner Email"
                type="email"
                value={form.owner_email}
                onChange={(value) =>
                  updateField("owner_email", value)
                }
              />

              <Input
                label="Company Email"
                type="email"
                value={form.company_email}
                onChange={(value) =>
                  updateField("company_email", value)
                }
              />

              <Input
                label="Phone"
                value={form.phone}
                onChange={(value) =>
                  updateField("phone", value)
                }
              />

            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              🔗 Online Presence
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <Input
                label="Landing Page"
                type="url"
                value={form.landing_page}
                onChange={(value) =>
                  updateField("landing_page", value)
                }
              />

              <Input
                label="Social Media"
                type="url"
                value={form.social_media}
                onChange={(value) =>
                  updateField("social_media", value)
                }
              />

              <Input
                label="Owner LinkedIn"
                type="url"
                value={form.owner_linkedin}
                onChange={(value) =>
                  updateField("owner_linkedin", value)
                }
              />

              <Input
                label="Company LinkedIn"
                type="url"
                value={form.company_linkedin}
                onChange={(value) =>
                  updateField("company_linkedin", value)
                }
              />

              <Input
                label="Screenshot URL"
                type="url"
                value={form.screenshot_url}
                onChange={(value) =>
                  updateField("screenshot_url", value)
                }
              />

            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              🔎 Research Insights
            </h2>

            <div className="mt-6 space-y-5">

              <Textarea
                label="Main Problem"
                value={form.main_problem}
                onChange={(value) =>
                  updateField("main_problem", value)
                }
              />

              <Textarea
                label="Recommended Service"
                value={form.service}
                onChange={(value) =>
                  updateField("service", value)
                }
              />

              <Textarea
                label="Research Notes"
                value={form.research_notes}
                onChange={(value) =>
                  updateField("research_notes", value)
                }
              />

            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              📊 Lead Management
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              <Input
                label="Lead Score"
                type="number"
                value={form.lead_score}
                onChange={(value) =>
                  updateField("lead_score", value)
                }
              />

              <Select
                label="Priority"
                value={form.priority}
                onChange={(value) =>
                  updateField("priority", value)
                }
                options={["Low", "Warm", "Hot"]}
              />

              <Select
                label="Status"
                value={form.status}
                onChange={(value) =>
                  updateField("status", value)
                }
                options={[
                  "New",
                  "Contacted",
                  "Follow-up",
                  "Qualified",
                  "Won",
                  "Lost",
                ]}
              />

              <Input
                label="Follow-up Date"
                type="date"
                value={form.follow_up_date}
                onChange={(value) =>
                  updateField("follow_up_date", value)
                }
              />

            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

            <Link
              href={`/leads/${leadId}`}
              className="rounded-lg border border-slate-700 px-6 py-3 text-center hover:bg-slate-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-400">
        {label}
      </span>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-400">
        {label}
      </span>

      <textarea
        rows={5}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
      />
    </label>
  );
}
