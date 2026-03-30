import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from '@privy-io/react-auth';
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
import Login from "@/pages/Login";

import PoolHealthDashboard from "@/pages/PoolHealthDashboard";
import AntiDumpSlippageDashboard from "@/pages/AntiDumpSlippageDashboard";
import ContractReserves from "@/pages/ContractReserves";
import CreatorPage from "@/pages/CreatorPage";
import ProtectedCreatorPortal from "@/components/auth/ProtectedCreatorPortal";
import ProtectedNFTModule from "@/components/auth/ProtectedNFTModule";
import ProtectedRewardsModule from "@/components/auth/ProtectedRewardsModule";
import CookieConsentBanner from "@/components/gdpr/CookieConsentBanner";
import { SecurityTest } from "@/pages/SecurityTest";
function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/getting-started" component={GettingStarted} />
      <Route path="/login" component={Login} />
      <Route path="/creators" component={CreatorPage} />
      <Route path="/staking" component={PolStakingPage} />
      <Route path="/automation" component={AutomationPage} />
      <Route path="/content-certificate" component={ProtectedNFTModule} />

      <Route path="/pool-health" component={PoolHealthDashboard} />
      <Route path="/anti-dump" component={AntiDumpSlippageDashboard} />
      <Route path="/contract-reserves" component={ContractReserves} />
      <Route path="/pool-debug" component={PoolDebugger} />
      <Route path="/citations" component={ProtectedRewardsModule} />
      <Route path="/citations/:walletAddress" component={CitationsByWallet} />
      <Route path="/security-test" component={SecurityTest} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID || 'cmn0xgyny01ra0ciijd8kc2kk'; // Fallback if env is missing

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'wallet', 'google', 'apple'],
        appearance: {
          theme: 'dark',
          accentColor: '#10b981', // Emerald green to match WebPayback
          logo: '/logo.png', 
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        supportedChains: [{
          id: 1942999413, // Humanity Protocol Testnet Chain ID
          name: 'Humanity Testnet',
          network: 'humanity-testnet',
          nativeCurrency: { name: 'tHP', symbol: 'tHP', decimals: 18 },
          rpcUrls: {
            default: { http: ['https://rpc.testnet.humanity.org'] },
            public: { http: ['https://rpc.testnet.humanity.org'] }
          },
          blockExplorers: {
            default: { name: 'Humanity Explorer', url: 'https://explorer.testnet.humanity.org' }
          }
        }],
        defaultChain: {
          id: 1942999413, // Humanity Protocol Testnet Chain ID
          name: 'Humanity Testnet',
          network: 'humanity-testnet',
          nativeCurrency: { name: 'tHP', symbol: 'tHP', decimals: 18 },
          rpcUrls: {
            default: { http: ['https://rpc.testnet.humanity.org'] },
            public: { http: ['https://rpc.testnet.humanity.org'] }
          },
          blockExplorers: {
            default: { name: 'Humanity Explorer', url: 'https://explorer.testnet.humanity.org' }
          }
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
          <CookieConsentBanner />
        </TooltipProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default App;
