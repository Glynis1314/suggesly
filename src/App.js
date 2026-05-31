import { useState } from 'react';
import AppShell from './layout/AppShell';
import DashboardPage from './pages/dashboard/DashboardPage';
import DealsPage from './pages/deals/DealsPage';
import AccountsPage from './pages/accounts/AccountsPage';
import ContactsPage from './pages/contacts/ContactsPage';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'Dashboard' && <DashboardPage />}
      {activeTab === 'Deals' && <DealsPage />}
      {activeTab === 'Accounts' && <AccountsPage />}
      {activeTab === 'Contacts' && <ContactsPage />}
    </AppShell>
  );
}

export default App;
