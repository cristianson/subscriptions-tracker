import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Subscriptions from "@/pages/Subscriptions";
import Calendar from "@/pages/Calendar";
import Notifications from "@/pages/Notifications";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/subscriptions" component={Subscriptions} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/notifications" component={Notifications} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
