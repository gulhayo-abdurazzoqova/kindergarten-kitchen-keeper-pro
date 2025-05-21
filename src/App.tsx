
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./components/layout/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ReportsDashboard from "./components/reports/ReportsDashboard";
import IngredientList from "./components/ingredients/IngredientList";
import MealList from "./components/meals/MealList";
import ServeMeal from "./components/serving/ServeMeal";
import Settings from "./pages/Settings";
import { useKitchenStore } from "./store";

const queryClient = new QueryClient();

// Auth protection wrapper component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser } = useKitchenStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [currentUser, navigate, location]);

  return currentUser ? children : null;
};

// Role-based route protection
const RoleProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: JSX.Element;
  allowedRoles: string[];
}) => {
  const { currentUser } = useKitchenStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser && !allowedRoles.includes(currentUser.role)) {
      // Redirect to dashboard if user doesn't have required role
      navigate("/");
    }
  }, [currentUser, allowedRoles, navigate, location]);

  return currentUser && allowedRoles.includes(currentUser.role) ? children : null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<ReportsDashboard />} />
            
            <Route 
              path="ingredients" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']}>
                  <IngredientList />
                </RoleProtectedRoute>
              } 
            />
            
            <Route 
              path="meals" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']}>
                  <MealList />
                </RoleProtectedRoute>
              } 
            />
            
            <Route path="serving" element={<ServeMeal />} />
            
            <Route 
              path="reports" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']}>
                  <ReportsDashboard />
                </RoleProtectedRoute>
              } 
            />

            <Route 
              path="settings" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']}>
                  <Settings />
                </RoleProtectedRoute>
              } 
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
