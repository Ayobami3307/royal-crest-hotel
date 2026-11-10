import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import Availability from './Availability';
import Bookings from './Bookings';
import Customers from './Customers';
import Dashboard from './Dashboard';
import Messages from './Messages';
import RoomsAdmin from './RoomsAdmin';
import { Spinner } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

function RequireStaff({ children }) {
  const { user, checking } = useAuth();
  if (checking) return <div className="admin-boot"><Spinner label="Checking your session" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        element={
          <RequireStaff>
            <AdminLayout />
          </RequireStaff>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="rooms" element={<RoomsAdmin />} />
        <Route path="availability" element={<Availability />} />
        <Route path="customers" element={<Customers />} />
        <Route path="messages" element={<Messages />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
