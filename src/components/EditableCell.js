import { useEffect, useRef, useState } from 'react';
import OwnerAvatar from './OwnerAvatar';
import StageBadge from './StageBadge';

function isValidUrl(value) {
  return typeof value === 'string' && /^https?:\/\/.+/.test(value);
}

function LinkIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M10 14a2 2 0 0 1 0-2l4-4a2 2 0 0 1 2.828 2.828L13.828 14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 10a2 2 0 0 1 0 2l-4 4a2 2 0 0 1-2.828-2.828L10.172 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function EditableCell({ value, type = 'text', options = [], onSave }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(type === 'multiselect' ? value ?? [] : value ?? '');
  const [newTag, setNewTag] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    setLocal(type === 'multiselect' ? value ?? [] : value ?? '');
  }, [value, type]);

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  const save = () => {
    setEditing(false);
    if (onSave) onSave(local);
  };

  if (type === 'stage') {
    return (
      <div className="relative">
        <button type="button" onClick={() => setEditing((e) => !e)} className="hover:bg-slate-50 rounded-full px-3 py-1">
          <StageBadge stage={local} />
        </button>
        {editing && (
          <div className="absolute left-0 z-30 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setLocal(opt);
                    setEditing(false);
                    if (onSave) onSave(opt);
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm ${opt === local ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="inline-flex w-full items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 hover:bg-slate-100"
        >
          <span>{local || 'Select'}</span>
          <span className="text-slate-400">▾</span>
        </button>
        {editing && (
          <div className="absolute left-0 z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setLocal(opt);
                    setEditing(false);
                    if (onSave) onSave(opt);
                  }}
                  className={`block w-full rounded-2xl px-3 py-2 text-left text-sm ${opt === local ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'owner') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="flex w-full items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 hover:bg-slate-100"
        >
          <span className="flex items-center gap-2">
            <OwnerAvatar owner={local || 'Select owner'} />
          </span>
          <span className="text-slate-400">▾</span>
        </button>
        {editing && (
          <div className="absolute left-0 z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <input
              ref={ref}
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Type or select owner"
              className="mb-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none"
            />
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setLocal(opt);
                    setEditing(false);
                    if (onSave) onSave(opt);
                  }}
                  className={`block w-full rounded-2xl px-3 py-2 text-left text-sm ${opt === local ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  if (onSave) onSave(local);
                }}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'multiselect') {
    const selectedValues = Array.isArray(local) ? local : [];
    const toggleValue = (opt) => {
      if (selectedValues.includes(opt)) {
        setLocal(selectedValues.filter((item) => item !== opt));
      } else {
        setLocal([...selectedValues, opt]);
      }
    };

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="inline-flex w-full items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 hover:bg-slate-100"
        >
          <span className="flex flex-wrap gap-2">
            {selectedValues.length > 0 ? (
              selectedValues.map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {item}
                </span>
              ))
            ) : (
              'Select values'
            )}
          </span>
          <span className="text-slate-400">▾</span>
        </button>
        {editing && (
          <div className="absolute left-0 z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <div className="space-y-3">
              <input
                ref={ref}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    e.preventDefault();
                    if (!selectedValues.includes(newTag.trim())) {
                      setLocal([...selectedValues, newTag.trim()]);
                    }
                    setNewTag('');
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none"
              />
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleValue(opt)}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm ${selectedValues.includes(opt) ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>{opt}</span>
                    {selectedValues.includes(opt) && <span className="text-slate-400">✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    if (onSave) onSave(selectedValues);
                  }}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'linkedin') {
    const isValid = isValidUrl(local);
    return (
      <div onClick={() => !editing && setEditing(true)} className="hover:bg-slate-50 cursor-pointer rounded">
        {editing ? (
          <input
            ref={ref}
            type="url"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={save}
            placeholder="https://"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none"
          />
        ) : isValid ? (
          <a href={local} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700">
            <LinkIcon />
            <span className="text-sm">LinkedIn</span>
          </a>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </div>
    );
  }

  return (
    <div onClick={() => !editing && setEditing(true)} className="hover:bg-slate-50 cursor-text rounded">
      {editing ? (
        <div>
          {type === 'textarea' ? (
            <textarea ref={ref} value={local} onChange={(e) => setLocal(e.target.value)} onBlur={save} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none" />
          ) : type === 'email' ? (
            <input ref={ref} type="email" value={local} onChange={(e) => setLocal(e.target.value)} onBlur={save} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none" />
          ) : type === 'date' ? (
            <input ref={ref} type="date" value={local} onChange={(e) => setLocal(e.target.value)} onBlur={save} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none" />
          ) : (
            <input ref={ref} value={local} onChange={(e) => setLocal(e.target.value)} onBlur={save} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none" />
          )}
        </div>
      ) : (
        <div className={type === 'email' ? 'text-sm text-teal-600 hover:underline' : 'text-sm text-slate-900'}>
          {type === 'email' ? (
            <a href={`mailto:${value}`} className="text-teal-600 hover:underline">{value || '—'}</a>
          ) : (
            value || '—'
          )}
        </div>
      )}
    </div>
  );
}
