import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/terms";
import TestConnectivity from "@/pages/test-connectivity";
import PolStakingPage from "@/pages/PolStakingPage";
import Citations from "@/pages/Citations";
import CitationsByWallet from "@/pages/CitationsByWallet";
import PoolDebugger from "@/pages/PoolDebugger";
import CookieConsentBanner from "@/components/gdpr/CookieConsentBanner";
function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/staking" component={PolStakingPage} />
      <Route path="/pool-debug" component={PoolDebugger} />
      <Route path="/citations" component={Citations} />
      <Route path="/citations/:walletAddress" component={CitationsByWallet} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
        <CookieConsentBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
