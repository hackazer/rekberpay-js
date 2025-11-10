import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EscrowCreate from "./pages/EscrowCreate";
import EscrowDetail from "./pages/EscrowDetail";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfile from "./pages/UserProfile";
import DisputeDetail from "./pages/DisputeDetail";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      
      {/* Protected user routes */}
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/escrow/create"} component={EscrowCreate} />
      <Route path={"/escrow/:id"} component={EscrowDetail} />
      <Route path={"/profile"} component={UserProfile} />
      <Route path={"/dispute/:id"} component={DisputeDetail} />
      
      {/* Admin routes */}
      <Route path={"/admin"} component={AdminDashboard} />
      
      {/* Error routes */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
