import { useMemo } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import AppShell from './layout/AppShell';
import DashboardPage from './pages/dashboard/DashboardPage';
import DealsPage from './pages/deals/DealsPage';
import DealDetailPage from './pages/deals/DealDetailPage';
import AccountsPage from './pages/accounts/AccountsPage';
import ContactsPage from './pages/contacts/ContactsPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/auth';

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
      Dashboard: '/dashboard',
      Accounts: '/accounts',
      Deals: '/deals',
      Contacts: '/contacts',
      Template: '/templates',
      Sequences: '/sequences',
    };

    navigate(pathMap[tab] || '/dashboard');
  };

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
      <Route path="/forgot-password" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
      <Route path="/reset-password" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/deals/:dealId" element={<DealDetailPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/settings" element={<div className="p-8 text-slate-700">Settings page coming soon.</div>} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
