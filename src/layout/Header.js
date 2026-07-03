import React from 'react';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" strokeLinecap="round" />
    </svg>
  );
}

function IconButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-slate-100 hover:text-slate-700"
    >
      {children}
    </button>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
      <div className="flex flex-1 items-center gap-3">
        <label className="flex w-full max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 shadow-sm">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search deals, people, or companies..."
            className="w-full border-none bg-transparent outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <div className="ml-6 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <IconButton label="Mail" onClick={() => {}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>
          <IconButton label="Notifications" onClick={() => {}}>
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M9 18h6" strokeLinecap="round" />
                <path d="M6 16V10a6 6 0 0 1 12 0v6" strokeLinecap="round" />
                <path d="M8 16h8" strokeLinecap="round" />
              </svg>
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500" />
            </div>
          </IconButton>
          <IconButton label="Help" onClick={() => {}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9.5a2.5 2.5 0 0 1 4.7 1.2c0 1.5-2.2 2.2-2.2 3.8" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </IconButton>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-lg font-semibold">Alex Rivera</p>
            <p className="text-xs tracking-wide text-slate-400">Account Executive</p>
          </div>

          <div className="h-11 w-11 overflow-hidden rounded-full bg-orange-100">
            <img
              src="https://api.dicebear.com/9.x/personas/svg?seed=Alex%20Rivera"
              alt="Profile"
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
