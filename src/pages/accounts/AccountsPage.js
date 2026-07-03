import { useMemo, useState } from "react";
import { accountsRows, accountStageOptions } from "../../data/accountsData";

const customFilterFields = [
  { label: "Company Name", value: "company" },
  { label: "Website", value: "site" },
  { label: "Owner", value: "owner" },
  { label: "Location", value: "location" },
  { label: "Source", value: "source" },
  { label: "Stage", value: "stage" },
  { label: "Last Activity", value: "activity" },
  { label: "Created", value: "created" },
  { label: "Follow Up Date", value: "followUpDate" },
];

const getAccountFieldValue = (row, field) => {
  if (field === "stage") {
    return row.stage ?? "Created";
  }

  return row[field] ?? "";
};

export default function AccountsPage() {
  const [selectedStage, setSelectedStage] = useState("All");
  const [customFilterField, setCustomFilterField] = useState("company");
  const [customFilterValue, setCustomFilterValue] = useState("");

  const filteredRows = useMemo(
    () =>
      accountsRows.filter((row) => {
        const stageMatch =
          selectedStage === "All" || (row.stage ?? "Created") === selectedStage;
        const customSearch = customFilterValue.trim().toLowerCase();
        const customMatch =
          customSearch === "" ||
          String(getAccountFieldValue(row, customFilterField))
            .toLowerCase()
            .includes(customSearch);

        return stageMatch && customMatch;
      }),
    [selectedStage, customFilterField, customFilterValue],
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
          <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
            <label className="flex items-center gap-2 border-r border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Field
              <select
                value={customFilterField}
                onChange={(e) => setCustomFilterField(e.target.value)}
                className="bg-transparent text-base font-medium normal-case tracking-normal text-slate-800 outline-none"
              >
                {customFilterFields.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Search
              <input
                value={customFilterValue}
                onChange={(e) => setCustomFilterValue(e.target.value)}
                placeholder="Type value"
                className="w-56 bg-transparent text-base font-medium normal-case tracking-normal text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead className="bg-slate-50 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Company Name</th>
                <th className="px-5 py-4">Owner</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Stage</th>
                <th className="px-5 py-4">Last Activity</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Follow Up Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.company}
                  className="border-t border-slate-200 align-top"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-base font-semibold ${row.color}`}
                      >
                        {row.init}
                      </div>
                      <div>
                        <p className="text-lg font-semibold leading-8 text-slate-950">
                          {row.company}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-slate-400">
                          {row.site}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-lg leading-6 text-slate-900">
                    {row.owner}
                  </td>
                  <td className="px-5 py-4 text-lg leading-6 text-slate-800">
                    {row.location}
                  </td>
                  <td className="px-5 py-4 text-lg leading-6 text-slate-800">
                    {row.source}
                  </td>
                  <td className="px-5 py-4 text-lg leading-6 text-slate-800">
                    {row.stage ?? "Created"}
                  </td>
                  <td className="px-5 py-4 text-lg leading-6 text-slate-500">
                    {row.activity}
                  </td>
                  <td className="px-5 py-4 text-lg leading-6 text-slate-500">
                    {row.created}
                  </td>
                  <td className="px-5 py-4 text-lg leading-6 text-slate-500">
                    {row.followUpDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
