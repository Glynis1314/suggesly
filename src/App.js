import { useMemo } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AppShell from './layout/AppShell';
import DashboardPage from './pages/dashboard/DashboardPage';
import DealsPage from './pages/deals/DealsPage';
import DealDetailPage from './pages/deals/DealDetailPage';
import AccountsPage from './pages/accounts/AccountsPage';
import ContactsPage from './pages/contacts/ContactsPage';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => {
    if (location.pathname.startsWith('/deals')) return 'Deals';
    if (location.pathname.startsWith('/accounts')) return 'Accounts';
    if (location.pathname.startsWith('/contacts')) return 'Contacts';
    return 'Dashboard';
  }, [location.pathname]);

  const setActiveTab = (tab) => {
    const pathMap = {
      Dashboard: '/',
      Accounts: '/accounts',
      Deals: '/deals',
      Contacts: '/contacts',
      Template: '/deals',
      Sequences: '/deals',
    };

    navigate(pathMap[tab] || '/');
  };

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deals/:dealId" element={<DealDetailPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
