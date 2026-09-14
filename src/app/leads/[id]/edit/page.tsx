"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LeadForm = {
  company_name: string;
  website: string;
  country: string;
  city: string;
  niche: string;
  business_type: string;
  decision_maker: string;
  role: string;
  email: string;
  phone: string;
  lead_score: string;
  priority: string;
  status: string;
  follow_up_date: string;
  service_opportunity: string;
  research_notes: string;
};

const emptyLead: LeadForm = {
  company_name: "",
  website: "",
  country: "",
  city: "",
  niche: "",
  business_type: "",
  decision_maker: "",
  role: "",
  email: "",
  phone: "",
  lead_score: "0",
  priority: "Low",
  status: "New",
  follow_up_date: "",
  service_opportunity: "",
  research_notes: "",
};

export default function EditLeadPage() {
  const params = useParams();
  const router = useRouter();

  const [form, setForm] = useState<LeadForm>(emptyLead);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadLead() {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", params.id)
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
        decision_maker: data.decision_maker ?? "",
        role: data.role ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        lead_score: String(data.lead_score ?? 0),
        priority: data.priority ?? "Low",
        status: data.status ?? "New",
        follow_up_date: data.follow_up_date ?? "",
        service_opportunity: data.service_opportunity ?? "",
        research_notes: data.research_notes ?? "",
      });

      setLoading(false);
    }

    loadLead();
  }, [params.id]);

  function updateField(name: keyof LeadForm, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);

    const { error } = await supabase
      .from("leads")
      .update({
        company_name: form.company_name,
        website: form.website || null,
        country: form.country || null,
        city: form.city || null,
        niche: form.niche || null,
        business_type: form.business_type || null,
        decision_maker: form.decision_maker || null,
        role: form.role || null,
        email: form.email || null,
        phone: form.phone || null,
        lead_score: Number(form.lead_score) || 0,
        priority: form.priority,
        status: form.status,
        follow_up_date: form.follow_up_date || null,
        service_opportunity: form.service_opportunity || null,
        research_notes: form.research_notes || null,
      })
      .eq("id", params.id);

    if (error) {
      alert("Failed to update lead: " + error.message);
      setSaving(false);
      return;
    }

    router.push(`/leads/${params.id}`);
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
      <div className="mx-auto max-w-4xl p-6 md:p-10">

        <Link
          href={`/leads/${params.id}`}
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
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              🏢 Business Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <Input
                label="Company Name"
                value={form.company_name}
                onChange={(value) => updateField("company_name", value)}
                required
              />

              <Input
                label="Website"
                value={form.website}
                onChange={(value) => updateField("website", value)}
              />

              <Input
                label="Country"
                value={form.country}
                onChange={(value) => updateField("country", value)}
              />

              <Input
                label="City"
                value={form.city}
                onChange={(value) => updateField("city", value)}
              />

              <Input
                label="Niche"
                value={form.niche}
                onChange={(value) => updateField("niche", value)}
              />

              <Input
                label="Business Type"
                value={form.business_type}
                onChange={(value) => updateField("business_type", value)}
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
                onChange={(value) => updateField("decision_maker", value)}
              />

              <Input
                label="Role"
                value={form.role}
                onChange={(value) => updateField("role", value)}
              />

              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
              />

              <Input
                label="Phone"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
              />

            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              📊 Lead Management
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-3">

              <Input
                label="Lead Score"
                type="number"
                value={form.lead_score}
                onChange={(value) => updateField("lead_score", value)}
              />

              <Select
                label="Priority"
                value={form.priority}
                onChange={(value) => updateField("priority", value)}
                options={["Low", "Warm", "Hot"]}
              />

              <Input
                label="Follow-up Date"
                type="date"
                value={form.follow_up_date}
                onChange={(value) =>
                  updateField("follow_up_date", value)
                }
              />

              <Select
                label="Status"
                value={form.status}
                onChange={(value) => updateField("status", value)}
                options={[
                  "New",
                  "Contacted",
                  "Follow-up",
                  "Qualified",
                  "Won",
                  "Lost",
                ]}
              />

            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              💼 Opportunity & Notes
            </h2>

            <div className="mt-6 space-y-5">

              <Textarea
                label="Service Opportunity"
                value={form.service_opportunity}
                onChange={(value) =>
                  updateField("service_opportunity", value)
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

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

            <Link
              href={`/leads/${params.id}`}
              className="rounded-lg border border-slate-700 px-6 py-3 text-center hover:bg-slate-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
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
        onChange={(event) => onChange(event.target.value)}
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
        onChange={(event) => onChange(event.target.value)}
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
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
      />
    </label>
  );
}
