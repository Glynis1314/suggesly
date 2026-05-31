import React from "react";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-end border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-4">
        <div className="hidden text-right md:block">
          <p className="text-lg font-semibold">Alex Rivera</p>
          <p className="text-xs tracking-wide text-slate-400">
            Account Executive
          </p>
        </div>

        <div className="h-11 w-11 overflow-hidden rounded-full bg-orange-100">
          <img
            src="https://api.dicebear.com/9.x/personas/svg?seed=Alex%20Rivera"
            alt="Profile"
            className="h-full w-full"
          />
        </div>
      </div>
    </header>
  );
}
