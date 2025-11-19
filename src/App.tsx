import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import GuestDiagnostic from "./pages/GuestDiagnostic";
import DiagnosticForm from "./pages/DiagnosticForm";
import DiagnosticResult from "./pages/DiagnosticResult";
import DiagnosticHistory from "./pages/DiagnosticHistory";
import MissionsList from "./pages/MissionsList";
import MissionDetail from "./pages/MissionDetail";
import Marketplace from "./pages/Marketplace";
import Cart from "./pages/Cart";
import PaymentSuccess from "./pages/PaymentSuccess";
import Pointage from "./pages/Pointage";
import PointageAdmin from "./pages/PointageAdmin";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/diagnostic" element={<ProtectedRoute><DiagnosticForm /></ProtectedRoute>} />
          <Route path="/dashboard/diagnostic-result/:id" element={<ProtectedRoute><DiagnosticResult /></ProtectedRoute>} />
          <Route path="/dashboard/diagnostic-history" element={<ProtectedRoute><DiagnosticHistory /></ProtectedRoute>} />
          <Route path="/missions" element={<ProtectedRoute><MissionsList /></ProtectedRoute>} />
          <Route path="/missions/:id" element={<ProtectedRoute><MissionDetail /></ProtectedRoute>} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/pointage" element={<ProtectedRoute><Pointage /></ProtectedRoute>} />
          <Route path="/pointage/admin" element={<ProtectedRoute><PointageAdmin /></ProtectedRoute>} />
          <Route path="/guest/diagnostic" element={<GuestDiagnostic />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
