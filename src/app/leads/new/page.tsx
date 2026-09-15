"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  calculateLeadScore,
  calculateLeadPriority,
} from "@/lib/lead-scoring";

export default function NewLeadPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const liveScore = calculateLeadScore(formValues);
  const livePriority = calculateLeadPriority(liveScore);

  function handleFormChange(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const data = new FormData(form);
    const values: Record<string, string> = {};

    data.forEach((value, key) => {
      values[key] = String(value);
    });

    setFormValues(values);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const { error } = await supabase.from("leads").insert({
      company_name: formData.get("company_name") as string,
      website: formData.get("website") as string,
      country: formData.get("country") as string,
      city: formData.get("city") as string,
      niche: formData.get("niche") as string,
      business_type: formData.get("business_type") as string,
      decision_maker: formData.get("decision_maker") as string,
      owner_email: formData.get("owner_email") as string,
      phone: formData.get("phone") as string,
      social_media: formData.get("social_media") as string,
      owner_linkedin: formData.get("owner_linkedin") as string,
      company_linkedin: formData.get("company_linkedin") as string,
      company_email: formData.get("company_email") as string,
      screenshot_url: formData.get("screenshot_url") as string,
      service: formData.get("service") as string,
      landing_page: formData.get("landing_page") as string,
      main_problem: formData.get("main_problem") as string,
      research_notes: formData.get("research_notes") as string,
      lead_score: calculateLeadScore({
        website: formData.get("website") as string,
        landing_page: formData.get("landing_page") as string,
        decision_maker: formData.get("decision_maker") as string,
        owner_email: formData.get("owner_email") as string,
        phone: formData.get("phone") as string,
        social_media: formData.get("social_media") as string,
        owner_linkedin: formData.get("owner_linkedin") as string,
        company_linkedin: formData.get("company_linkedin") as string,
        company_email: formData.get("company_email") as string,
        main_problem: formData.get("main_problem") as string,
        service: formData.get("service") as string,
        research_notes: formData.get("research_notes") as string,
      }),
      priority: calculateLeadPriority(
        calculateLeadScore({
          website: formData.get("website") as string,
          landing_page: formData.get("landing_page") as string,
          decision_maker: formData.get("decision_maker") as string,
          owner_email: formData.get("owner_email") as string,
          phone: formData.get("phone") as string,
          social_media: formData.get("social_media") as string,
          owner_linkedin: formData.get("owner_linkedin") as string,
          company_linkedin: formData.get("company_linkedin") as string,
          company_email: formData.get("company_email") as string,
          main_problem: formData.get("main_problem") as string,
          service: formData.get("service") as string,
          research_notes: formData.get("research_notes") as string,
        })
      ),
      status: "New",
      follow_up_date:
        (formData.get("follow_up_date") as string) || null,
    });

    setLoading(false);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    setMessage("Lead saved successfully! 🎉");
    event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">

        <aside className="hidden w-64 border-r border-slate-800 bg-slate-900 p-6 md:block">
          <Link href="/" className="mb-10 block text-xl font-bold">
            🎯 Client Hunter
          </Link>

          <nav className="space-y-2 text-sm">
            <Link
              href="/"
              className="block rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/leads"
              className="block rounded-lg bg-blue-600 px-4 py-3 font-medium"
            >
              👥 Leads
            </Link>
          </nav>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <div className="mx-auto max-w-4xl">

            <div className="mb-8">
              <Link
                href="/leads"
                className="text-sm text-slate-400 hover:text-white"
              >
                ← Back to Leads
              </Link>

              <h1 className="mt-4 text-3xl font-bold">
                Add New Lead
              </h1>

              <p className="mt-2 text-slate-400">
                Save a potential client to your CRM.
              </p>
            </div>

            <form onSubmit={handleSubmit} onChange={handleFormChange} className="space-y-8">

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="mb-6 text-lg font-semibold">
                  🏢 Business Information
                </h2>

                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Company Name *
                    </label>

                    <input
                      name="company_name"
                      type="text"
                      required
                      placeholder="Example Company"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Website
                    </label>

                    <input
                      name="website"
                      type="url"
                      placeholder="https://example.com"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Country
                    </label>

                    <input
                      name="country"
                      type="text"
                      placeholder="USA"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      City / Area
                    </label>

                    <input
                      name="city"
                      type="text"
                      placeholder="Orlando"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Niche
                    </label>

                    <input
                      name="niche"
                      type="text"
                      placeholder="Cleaning Services"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Business Type
                    </label>

                    <input
                      name="business_type"
                      type="text"
                      placeholder="Local Business"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="mb-6 text-lg font-semibold">
                  👤 Contact Information
                </h2>

                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Decision Maker
                    </label>

                    <input
                      name="decision_maker"
                      type="text"
                      placeholder="Full name"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Email
                    </label>

                    <input
                      name="owner_email"
                      type="email"
                      placeholder="hello@example.com"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Phone
                    </label>

                    <input
                      name="phone"
                      type="tel"
                      placeholder="+1 000 000 0000"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                </div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">
                      Live Lead Score
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {liveScore}/100
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">
                      Priority
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {livePriority === "Hot" && "🔥 "}
                      {livePriority === "Warm" && "🟡 "}
                      {livePriority === "Low" && "🔵 "}
                      {livePriority}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Score and priority update automatically as you add lead information.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="mb-6 text-lg font-semibold">
                  🎯 Lead Qualification
                </h2>

                <div className="grid gap-5 md:grid-cols-3">

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Lead Score
                    </label>

                    <input
                      name="lead_score"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="85"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Status
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-300">
                        Follow-up Date
                      </span>

                      <input
                        type="date"
                        name="follow_up_date"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                      />
                    </label>

                    <select
                      name="status"
                      defaultValue="New"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                    >
                      <option>New</option>
                      <option>Researched</option>
                      <option>Contacted</option>
                      <option>Replied</option>
                      <option>Follow-up</option>
                      <option>Won</option>
                      <option>Closed</option>
                    </select>
                  </div>

                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm text-slate-300">
                    Service
                  </label>

                  <input
                    name="service"
                    type="text"
                    placeholder="Landing Page, Website Redesign, CRO..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm text-slate-300">
                    Research Notes
                  </label>

                  <textarea
                    name="research_notes"
                    rows={6}
                    placeholder="Website problems, business information, potential opportunities..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`rounded-lg border p-4 text-sm ${
                    message.startsWith("Error")
                      ? "border-red-500/30 bg-red-500/10 text-red-300"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/leads"
                  className="rounded-lg border border-slate-700 px-6 py-3 text-center hover:bg-slate-800"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Lead"}
                </button>
              </div>

            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
