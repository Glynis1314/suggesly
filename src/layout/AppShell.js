import React from 'react';
import SideDrawer from './SideDrawer';
import Header from './Header';

export default function AppShell({ activeTab, setActiveTab, children }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-screen bg-surface-bg text-text-primary overflow-hidden">
      <SideDrawer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        drawerOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-surface-bg">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

