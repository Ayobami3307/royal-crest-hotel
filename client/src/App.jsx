import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import ScrollToTop from './components/ScrollToTop';
import { Spinner } from './components/States';
import About from './pages/About';
import Contact from './pages/Contact';
import Facilities from './pages/Facilities';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import ManageBooking from './pages/ManageBooking';
import NotFound from './pages/NotFound';
import Reservations from './pages/Reservations';
import Restaurant from './pages/Restaurant';
import RoomDetails from './pages/RoomDetails';
import Rooms from './pages/Rooms';

// The staff dashboard is split into its own chunk so guests never download it.
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="rooms/:slug" element={<RoomDetails />} />
          <Route path="restaurant" element={<Restaurant />} />
          <Route path="facilities" element={<Facilities />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="manage-booking" element={<ManageBooking />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="admin/*"
          element={
            <Suspense fallback={<div className="admin-boot"><Spinner label="Loading dashboard" /></div>}>
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}
