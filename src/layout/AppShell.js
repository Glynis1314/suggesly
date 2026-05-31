import React from 'react';
import SideDrawer from './SideDrawer';
import Header from './Header';

export default function AppShell({ activeTab, setActiveTab, children }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <SideDrawer
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          drawerOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        <main className="w-full">
          <Header onOpenDrawer={() => setDrawerOpen(true)} />
          {children}
        </main>
      </div>
    </div>
  );
}
