import React from "react";

const navItems = ["Dashboard", "Accounts", "Deals", "Contacts"];

export default function SideDrawer({
  activeTab,
  setActiveTab,
  drawerOpen,
  onClose,
}) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-5 transition-transform lg:static lg:translate-x-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <img
              src="/assets/suggesly_icon.png"
              alt="Suggesly icon"
              className="h-11 w-11 rounded-xl object-cover"
            />

            <div>
              <p className="text-2xl font-bold text-emerald-700">Suggesly</p>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Sales Simplified
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = item === activeTab;

            return (
              <button
                key={item}
                onClick={() => {
                  setActiveTab(item);
                  onClose();
                }}
                className={`w-full rounded-xl px-4 py-3 text-left text-lg font-medium transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>
      </aside>

      {drawerOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation drawer"
        />
      )}
    </>
  );
}
