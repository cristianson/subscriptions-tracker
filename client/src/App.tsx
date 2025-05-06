import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Subscriptions from "@/pages/Subscriptions";
import Calendar from "@/pages/Calendar";
import Notifications from "@/pages/Notifications";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={ProtectedDashboard} />
      <ProtectedRoute path="/subscriptions" component={ProtectedSubscriptions} />
      <ProtectedRoute path="/calendar" component={ProtectedCalendar} />
      <ProtectedRoute path="/notifications" component={ProtectedNotifications} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Wrap pages with Layout when authenticated
function ProtectedDashboard() {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

function ProtectedSubscriptions() {
  return (
    <Layout>
      <Subscriptions />
    </Layout>
  );
}

function ProtectedCalendar() {
  return (
    <Layout>
      <Calendar />
    </Layout>
  );
}

function ProtectedNotifications() {
  return (
    <Layout>
      <Notifications />
    </Layout>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
