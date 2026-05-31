import { useMemo, useState } from "react";
import {
  accountsRows,
  accountStageClasses,
  accountStageOptions,
} from "../../data/accountsData";

export default function AccountsPage() {
  const [accountStages, setAccountStages] = useState(
    Object.fromEntries(accountsRows.map((row) => [row.company, "Created"])),
  );
  const [selectedOwner, setSelectedOwner] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");

  const ownerOptions = useMemo(
    () => ["All", ...Array.from(new Set(accountsRows.map((row) => row.owner)))],
    [],
  );

  const filteredRows = useMemo(
    () =>
      accountsRows.filter((row) => {
        const ownerMatch =
          selectedOwner === "All" || row.owner === selectedOwner;
        const stageMatch =
          selectedStage === "All" ||
          accountStages[row.company] === selectedStage;
        return ownerMatch && stageMatch;
      }),
    [selectedOwner, selectedStage, accountStages],
  );

  return (
    <section className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mt-2 text-5xl font-semibold">Companies</h1>
          <p className="mt-2 text-2xl text-slate-500">
            Manage and track your corporate relationships across the pipeline.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl bg-emerald-700 px-5 py-3 text-xl font-medium text-white">
            + New Company
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-300 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="rounded-full bg-slate-100 px-3 py-1 text-xl text-slate-800">
            Stage:{" "}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-transparent text-xl outline-none"
            >
              <option value="All">All</option>
              {accountStageOptions.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
          <label className="rounded-full bg-slate-100 px-3 py-1 text-xl text-slate-800">
            Owner:{" "}
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="bg-transparent text-xl outline-none"
            >
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead className="bg-slate-50 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300"
                  />
                </th>
                <th className="px-5 py-4">Company Name</th>
                <th className="px-5 py-4">Owner</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Stage</th>
                <th className="px-5 py-4">Last Activity</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.company}
                  className="border-t border-slate-200 align-top"
                >
                  <td className="px-5 py-5">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300"
                    />
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-md text-xl font-semibold ${row.color}`}
                      >
                        {row.init}
                      </div>
                      <div>
                        <p className="text-3xl font-semibold leading-none">
                          {row.company}
                        </p>
                        <p className="mt-2 text-xl text-slate-400">
                          {row.site}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100">
                        <img
                          src={`https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(row.owner)}`}
                          alt={row.owner}
                        />
                      </div>
                      <p className="text-3xl leading-tight">{row.owner}</p>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-3xl leading-tight text-slate-800">
                    {row.location}
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex flex-wrap gap-2">
                      {row.source.map((src) => (
                        <span
                          key={src}
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${src === "LINKEDIN" ? "bg-emerald-100 text-emerald-700" : src === "EMAIL" || src === "CAMPAIGN" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-700"}`}
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-5">
                    <select
                      value={accountStages[row.company]}
                      onChange={(e) =>
                        setAccountStages((prev) => ({
                          ...prev,
                          [row.company]: e.target.value,
                        }))
                      }
                      className={`rounded-full border-0 px-3 py-1 text-sm font-semibold ${accountStageClasses[accountStages[row.company]]}`}
                    >
                      {accountStageOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-5 text-3xl text-slate-500">
                    {row.activity}
                  </td>
                  <td className="px-5 py-5 text-3xl text-slate-500">
                    {row.created}
                  </td>
                  <td className="px-5 py-5 text-4xl text-slate-400">...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
