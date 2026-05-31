import { useState } from 'react';
import { dealsRows, dealStageClasses, dealStageOptions } from '../../data/dealsData';

export default function DealsPage() {
  const [dealStages, setDealStages] = useState(
    Object.fromEntries(dealsRows.map((row) => [row.name, row.stage]))
  );

  return (
    <section className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Accounts <span className="mx-2">&gt;</span>
            <span className="font-medium text-slate-800">Deals</span>
          </p>
          <h1 className="mt-2 text-5xl font-semibold">Deals</h1>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xl font-medium text-slate-700">
            Export
          </button>
          <button className="rounded-xl bg-emerald-700 px-5 py-3 text-xl font-medium text-white">
            + New Deal
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-300 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="pr-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">View</p>
            <p className="text-3xl">All Deals</p>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="pr-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Stage</p>
            <p className="text-3xl">POC</p>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Owner</p>
            <p className="text-3xl">Me</p>
          </div>
          <button className="ml-auto text-xl font-semibold text-emerald-700">More Filters</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead className="bg-slate-50 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Deal Name</th>
                <th className="px-5 py-4">Deal Size (ARR)</th>
                <th className="px-5 py-4">Owner</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Stage</th>
                <th className="px-5 py-4">Create Date</th>
                <th className="px-5 py-4">Last Activity</th>
                <th className="px-5 py-4">Upcoming Task</th>
              </tr>
            </thead>
            <tbody>
              {dealsRows.map((row) => (
                <tr key={row.name} className="border-t border-slate-200 align-top">
                  <td className="px-5 py-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-100 text-xl font-semibold text-emerald-700">
                        {row.init}
                      </div>
                      <p className="text-3xl font-semibold leading-tight">{row.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-3xl">{row.size}</td>
                  <td className="px-5 py-5">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
                        <img
                          src={`https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(row.owner)}`}
                          alt={row.owner}
                        />
                      </div>
                      <p className="text-3xl leading-tight">{row.owner}</p>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-3xl">{row.source}</td>
                  <td className="px-5 py-5">
                    <select
                      value={dealStages[row.name]}
                      onChange={(e) =>
                        setDealStages((prev) => ({ ...prev, [row.name]: e.target.value }))
                      }
                      className={`rounded-full border-0 px-3 py-1 text-sm font-semibold ${dealStageClasses[dealStages[row.name]]}`}
                    >
                      {dealStageOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-5 text-3xl text-slate-500">{row.created}</td>
                  <td className="px-5 py-5 text-3xl text-slate-500">{row.activity}</td>
                  <td className="px-5 py-5 text-3xl text-emerald-700">{row.task}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-slate-500">
          <p className="text-2xl">Showing 1 to 5 of 128 deals</p>
          <div className="flex items-center gap-4 text-2xl">
            <button className="text-slate-400">&lt;</button>
            <span className="rounded bg-emerald-700 px-3 py-1 text-white">1</span>
            <span className="font-semibold text-slate-900">2</span>
            <span className="font-semibold text-slate-900">3</span>
            <button className="text-slate-900">&gt;</button>
          </div>
        </div>
      </div>
    </section>
  );
}
