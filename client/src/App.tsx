import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import GettingStarted from "@/pages/getting-started";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/terms";
import TestConnectivity from "@/pages/test-connectivity";
import PolStakingPage from "@/pages/PolStakingPage";
import Citations from "@/pages/Citations";
import CitationsByWallet from "@/pages/CitationsByWallet";
import PoolDebugger from "@/pages/PoolDebugger";
import AutomationPage from "@/pages/AutomationPage";
import { ContentCertificatePage } from "@/pages/ContentCertificatePage";

import PoolHealthDashboard from "@/pages/PoolHealthDashboard";
import AntiDumpSlippageDashboard from "@/pages/AntiDumpSlippageDashboard";
import ContractReserves from "@/pages/ContractReserves";
import AdminLogin from "@/pages/AdminLogin";
import AllowanceAdmin from "@/pages/admin/AllowanceAdmin";
import AutoPoolAdmin from "@/pages/admin/AutoPoolAdmin";
import CookieConsentBanner from "@/components/gdpr/CookieConsentBanner";
function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/getting-started" component={GettingStarted} />
      <Route path="/staking" component={PolStakingPage} />
      <Route path="/automation" component={AutomationPage} />
      <Route path="/content-certificate" component={ContentCertificatePage} />

      <Route path="/pool-health" component={PoolHealthDashboard} />
      <Route path="/anti-dump" component={AntiDumpSlippageDashboard} />
      <Route path="/contract-reserves" component={ContractReserves} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/allowance" component={AllowanceAdmin} />
      <Route path="/admin/auto-pool" component={AutoPoolAdmin} />
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
