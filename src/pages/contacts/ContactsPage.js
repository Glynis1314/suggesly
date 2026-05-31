import { useState } from 'react';
import {
  contactsRows,
  contactStageClasses,
  contactStageOptions,
} from '../../data/contactsData';

export default function ContactsPage() {
  const [contactStages, setContactStages] = useState(
    Object.fromEntries(contactsRows.map((row) => [row.email, 'Created']))
  );

  return (
    <section className="relative p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-5xl font-semibold">Contacts</h1>
          <p className="mt-2 text-2xl text-slate-500">
            Manage and track your customer relationships across the entire lifecycle.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xl font-medium text-slate-700">
            Export
          </button>
          <button className="rounded-xl bg-emerald-700 px-5 py-3 text-xl font-medium text-white">
            + New Contact
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-300 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-600">Total Contacts</p><p className="mt-3 text-5xl font-semibold">12,482 <span className="text-2xl text-emerald-600">+4.2%</span></p></div>
        <div className="rounded-xl border border-slate-300 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-600">Active Leads</p><p className="mt-3 text-5xl font-semibold">843 <span className="text-2xl text-emerald-700">↗</span></p></div>
        <div className="rounded-xl border border-slate-300 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-600">Qualified Ops</p><p className="mt-3 text-5xl font-semibold">215 <span className="text-2xl text-slate-500">18% Conv.</span></p></div>
        <div className="rounded-xl border border-slate-300 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Revenue Potential</p><p className="mt-3 text-5xl font-semibold text-emerald-700">$4.2M</p></div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-300 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3"><p className="text-2xl font-semibold">Filters</p><div className="h-8 w-px bg-slate-200" /><button className="rounded-full bg-slate-100 px-4 py-2 text-xl">Stage: All</button><button className="rounded-full bg-slate-100 px-4 py-2 text-xl">Owner: Me</button><button className="rounded-full bg-slate-100 px-4 py-2 text-xl">Country: Any</button><button className="ml-auto text-xl text-emerald-700">Clear all filters</button></div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1350px] w-full">
            <thead className="bg-slate-100 text-left text-sm font-semibold uppercase tracking-wide text-slate-700"><tr><th className="px-5 py-4">Contact Name</th><th className="px-5 py-4">Company</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Phone Number</th><th className="px-5 py-4">LinkedIn</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Stage</th><th className="px-5 py-4">Last Activity</th><th className="px-5 py-4">Created Date</th><th className="px-5 py-4">Notes</th></tr></thead>
            <tbody>
              {contactsRows.map((row) => (
                <tr key={row.email} className="border-t border-slate-200 align-top">
                  <td className="px-5 py-5"><div className="flex items-start gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-700">{row.initials}</div><p className="text-3xl leading-tight">{row.name}</p></div></td>
                  <td className="px-5 py-5 text-3xl">{row.company}</td>
                  <td className="px-5 py-5 text-3xl text-emerald-700">{row.email}</td>
                  <td className="px-5 py-5 text-3xl">{row.phone}</td>
                  <td className="px-5 py-5 text-3xl text-emerald-700">⛓</td>
                  <td className="px-5 py-5 text-3xl">{row.location}</td>
                  <td className="px-5 py-5">
                    <select
                      value={contactStages[row.email]}
                      onChange={(e) =>
                        setContactStages((prev) => ({ ...prev, [row.email]: e.target.value }))
                      }
                      className={`rounded-full border-0 px-3 py-1 text-sm font-semibold ${contactStageClasses[contactStages[row.email]]}`}
                    >
                      {contactStageOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-5 text-3xl text-slate-600">{row.activity}</td>
                  <td className="px-5 py-5 text-3xl text-slate-600">{row.created}</td>
                  <td className="max-w-[340px] px-5 py-5 text-3xl italic text-slate-700">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-slate-500"><p className="text-2xl">Showing 1 to 5 of 12,482 results</p><div className="flex items-center gap-4 text-2xl"><button className="text-slate-400">&lt;</button><span className="rounded bg-emerald-700 px-3 py-1 text-white">1</span><span className="text-slate-900">2</span><span className="text-slate-900">3</span><span className="text-slate-900">... 248</span><button className="text-slate-900">&gt;</button></div></div>
      </div>

      <button className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 text-5xl text-white shadow-lg">+</button>
    </section>
  );
}
