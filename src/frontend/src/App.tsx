import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/common';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Telemetry from './pages/Telemetry';
import Alerts from './pages/Alerts';
import Topology from './pages/Topology';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { REFRESH_INTERVALS } from './utils/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: REFRESH_INTERVALS.TELEMETRY,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="devices" element={<Devices />} />
                <Route path="telemetry" element={<Telemetry />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="topology" element={<Topology />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
