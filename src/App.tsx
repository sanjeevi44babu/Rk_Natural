import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Auth Pages
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import SetPassword from "./pages/SetPassword";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";
import ManagementDashboard from "./pages/ManagementDashboard";

// Main Pages
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import NewPatient from "./pages/NewPatient";
import EditPatient from "./pages/EditPatient";
import Appointments from "./pages/Appointments";
import AppointmentDetail from "./pages/AppointmentDetail";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Doctors from "./pages/Doctors";
import Supervisors from "./pages/Supervisors";
import Physiotherapists from "./pages/Physiotherapists";
import FrontdeskUsers from "./pages/FrontdeskUsers";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// New Pages
import RoomManagement from "./pages/RoomManagement";
import AllocateRoom from "./pages/AllocateRoom";

import CreateAppointment from "./pages/CreateAppointment";
import DischargePatient from "./pages/DischargePatient";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import DoctorSchedule from "./pages/DoctorSchedule";
import CreateStaffAccount from "./pages/CreateStaffAccount";
import PatientQRTag from "./pages/PatientQRTag";
import ScanPatient from "./pages/ScanPatient";
import HealthCheck from "./pages/HealthCheck";
import TodayReport from "./pages/TodayReport";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Help from "./pages/Help";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/forgot-password" element={<SetPassword />} />

      {/* Reports */}
      <Route path="/reports/today" element={<ProtectedRoute><TodayReport /></ProtectedRoute>} />

      {/* Profile & Settings */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Patients */}
      <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
      <Route path="/patients/new" element={<ProtectedRoute><NewPatient /></ProtectedRoute>} />
      <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
      <Route path="/patients/:id/edit" element={<ProtectedRoute><EditPatient /></ProtectedRoute>} />
      <Route path="/patients/:id/discharge" element={<ProtectedRoute><DischargePatient /></ProtectedRoute>} />
      <Route path="/patients/:id/qr-tag" element={<ProtectedRoute><PatientQRTag /></ProtectedRoute>} />
      <Route path="/scan-patient" element={<ProtectedRoute><ScanPatient /></ProtectedRoute>} />
      <Route path="/patients/:id/health-check" element={<ProtectedRoute><HealthCheck /></ProtectedRoute>} />

      {/* Appointments */}
      <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/appointments/new" element={<ProtectedRoute><CreateAppointment /></ProtectedRoute>} />
      <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />

      {/* Room Management */}
      <Route path="/rooms" element={<ProtectedRoute><RoomManagement /></ProtectedRoute>} />
      <Route path="/rooms/allocate" element={<ProtectedRoute><AllocateRoom /></ProtectedRoute>} />
      <Route path="/rooms/allocate/:patientId" element={<ProtectedRoute><AllocateRoom /></ProtectedRoute>} />

      <Route path="/management" element={<ProtectedRoute><ManagementDashboard /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/users/create-staff" element={<ProtectedRoute><CreateStaffAccount /></ProtectedRoute>} />
      <Route path="/users/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
      <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
      <Route path="/doctors/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
      <Route path="/supervisors" element={<ProtectedRoute><Supervisors /></ProtectedRoute>} />
      <Route path="/supervisors/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
      <Route path="/physiotherapists" element={<ProtectedRoute><Physiotherapists /></ProtectedRoute>} />
      <Route path="/physiotherapists/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
      <Route path="/frontdesk-users" element={<ProtectedRoute><FrontdeskUsers /></ProtectedRoute>} />

      {/* Schedule */}
      <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />

      {/* Settings & Profile */}
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/settings/*" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/my-schedule" element={<ProtectedRoute><DoctorSchedule /></ProtectedRoute>} />

      {/* Info Pages */}
      <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
      <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>
        <ThemeProvider defaultTheme="light" storageKey="naturecure-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" richColors />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
        </ThemeProvider>
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
