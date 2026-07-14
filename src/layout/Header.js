import React from 'react';
import { HelpCircle, LogOut, Mail, Settings, Bell, User, Menu } from 'lucide-react';
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
      className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    >
      {children}
    </button>
  );
}

export default function Header({ onOpenDrawer }) {
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
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-surface-border bg-surface-card/95 px-4 backdrop-blur-sm md:px-8">
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <label className="flex w-full max-w-xl items-center gap-2 rounded-full border border-surface-border bg-surface-bg px-4 py-2 text-sm text-text-secondary shadow-2xs transition-all focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search deals, people, or companies..."
            className="w-full border-none bg-transparent outline-none text-text-primary placeholder:text-text-muted"
          />
        </label>
      </div>

      <div className="ml-6 flex items-center gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <IconButton label="Mail" onClick={() => {}}>
            <Mail size={18} />
          </IconButton>
          <IconButton label="Notifications" onClick={() => {}}>
            <div className="relative">
              <Bell size={18} />
              <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-error" />
            </div>
          </IconButton>
          <IconButton label="Help" onClick={() => {}}>
            <HelpCircle size={18} />
          </IconButton>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-3 rounded-full px-2 py-1 text-left transition-colors hover:bg-surface-hover"
            onClick={() => setOpen((value) => !value)}
          >
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-text-primary">{profile?.name || 'Alex Rivera'}</p>
              <p className="text-xs font-medium tracking-wide text-text-muted">{profile?.role || 'Account Executive'}</p>
            </div>

            <Avatar src="https://api.dicebear.com/9.x/personas/svg?seed=Alex%20Rivera" alt="Profile" size="md" />
          </button>

          {open ? (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-surface-border bg-surface-card p-2 shadow-dropdown animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
              >
                <Avatar src="https://api.dicebear.com/9.x/personas/svg?seed=Alex%20Rivera" alt="Profile" size="lg" />
                <div>
                  <p className="font-semibold text-text-primary">{profile?.name || 'Alex Rivera'}</p>
                  <p className="text-xs text-text-secondary">{profile?.email || 'alex@example.com'}</p>
                  <p className="text-xs text-text-muted mt-0.5">{profile?.role || 'Account Executive'}</p>
                </div>
              </button>

              <div className="my-2 border-t border-surface-border" />

              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
              >
                <User size={16} />
                <span>View Profile</span>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                onClick={() => {
                  setOpen(false);
                  navigate('/settings');
                }}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>

              <div className="my-2 border-t border-surface-border" />

              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error/10"
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

