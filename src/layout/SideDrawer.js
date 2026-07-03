import React from 'react';

function NavIcon({ type, active }) {
  const iconClassName = `h-5 w-5 ${active ? 'text-emerald-700' : 'text-slate-500'}`;

  switch (type) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'accounts':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
          <path d="M4 19a4 4 0 0 1 8 0" />
          <circle cx="8" cy="9" r="3" />
          <path d="M16 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0v2" />
          <path d="M20 18a3 3 0 0 0-3-3" />
        </svg>
      );
    case 'deals':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
          <path d="M5 7h14" strokeLinecap="round" />
          <path d="M7 12h10" strokeLinecap="round" />
          <path d="M9 17h6" strokeLinecap="round" />
        </svg>
      );
    case 'contacts':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
          <path d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-4 9a4 4 0 0 1 8 0" />
          <path d="M16 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0v2" />
          <path d="M19 16a3 3 0 0 0-3-3" />
        </svg>
      );
    case 'template':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
          <path d="M7 3h8l4 4v14H7z" />
          <path d="M15 3v5h5" strokeLinecap="round" />
          <path d="M9 13h6" strokeLinecap="round" />
          <path d="M9 17h4" strokeLinecap="round" />
        </svg>
      );
    case 'sequences':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
          <path d="M7 7a4 4 0 0 1 6.7-2.7" strokeLinecap="round" />
          <path d="M17 17a4 4 0 0 1-6.7 2.7" strokeLinecap="round" />
          <path d="M7 7h4" strokeLinecap="round" />
          <path d="M13 17h4" strokeLinecap="round" />
        </svg>
      );
    case 'support':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 0 1 4.7 1.2c0 1.5-2.2 2.2-2.2 3.8" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path d="M19 12a7 7 0 0 0-.1-1.1l1.8-1.4-2-3.5-2.2 0.8a7 7 0 0 0-1.9-1.1L14 3h-4l-.5 2.3a7 7 0 0 0-1.9 1.1L5.4 5.9l-2 3.5 1.8 1.4A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.1l-1.8 1.4 2 3.5 2.2-.8a7 7 0 0 0 1.9 1.1L10 21h4l.5-2.3a7 7 0 0 0 1.9-1.1l2.2.8 2-3.5-1.8-1.4c.1-.3.1-.7.1-1.1Z" />
        </svg>
      );
    default:
      return null;
  }
}

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/' },
  { label: 'Accounts', icon: 'accounts', path: '/accounts' },
  { label: 'Deals', icon: 'deals', path: '/deals' },
  { label: 'Contacts', icon: 'contacts', path: '/contacts' },
  { label: 'Template', icon: 'template', path: '/deals' },
  { label: 'Sequences', icon: 'sequences', path: '/deals' },
];

const utilityItems = [
  { label: 'Support', icon: 'support' },
  { label: 'Settings', icon: 'settings' },
];

export default function SideDrawer({
  activeTab,
  setActiveTab,
  drawerOpen,
  onClose,
}) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white p-5 transition-transform lg:static lg:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
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
            const active = item.label === activeTab;

            return (
              <button
                key={item.label}
                onClick={() => {
                  setActiveTab(item.label);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-lg font-medium transition ${
                  active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <NavIcon type={item.icon} active={active} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4">
          <div className="space-y-2">
            {utilityItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-lg font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <NavIcon type={item.icon} active={false} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
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
