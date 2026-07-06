import React from 'react';
import { HelpCircle, LogOut, Mail, Settings, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { clearSession, readStoredUser } from '../utils/auth';

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
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const profile = readStoredUser();

  React.useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleLogout = () => {
    clearSession();
    setOpen(false);
    navigate('/login', { replace: true });
  };

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
            <Mail size={18} />
          </IconButton>
          <IconButton label="Notifications" onClick={() => {}}>
            <div className="relative">
              <Bell size={18} />
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500" />
            </div>
          </IconButton>
          <IconButton label="Help" onClick={() => {}}>
            <HelpCircle size={18} />
          </IconButton>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-3 rounded-full px-2 py-1 text-left transition hover:bg-slate-100"
            onClick={() => setOpen((value) => !value)}
          >
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-900">{profile?.name || 'Alex Rivera'}</p>
              <p className="text-xs tracking-wide text-slate-400">{profile?.role || 'Account Executive'}</p>
            </div>

            <Avatar src="https://api.dicebear.com/9.x/personas/svg?seed=Alex%20Rivera" alt="Profile" size="md" />
          </button>

          {open ? (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              <div className="flex items-center gap-3 px-3 py-3">
                <Avatar src="https://api.dicebear.com/9.x/personas/svg?seed=Alex%20Rivera" alt="Profile" size="lg" />
                <div>
                  <p className="font-semibold text-slate-900">{profile?.name || 'Alex Rivera'}</p>
                  <p className="text-xs text-slate-500">{profile?.email || 'alex@example.com'}</p>
                  <p className="text-xs text-slate-400">{profile?.role || 'Account Executive'}</p>
                </div>
              </div>

              <div className="my-2 border-t border-slate-100" />

              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                onClick={() => navigate('/settings')}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>

              <div className="my-2 border-t border-slate-100" />

              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
