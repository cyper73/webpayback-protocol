import { Route, Routes } from "react-router-dom";
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
import PolStakingPage from "@/pages/PolStakingPage";
import CitationsByWallet from "@/pages/CitationsByWallet";
import PoolDebugger from "@/pages/PoolDebugger";
import AutomationPage from "@/pages/AutomationPage";
import { ContentCertificatePage } from "@/pages/ContentCertificatePage";
import Login from "@/pages/Login";
import HumanityCallback from "@/pages/HumanityCallback";

import PoolHealthDashboard from "@/pages/PoolHealthDashboard";
import AntiDumpSlippageDashboard from "@/pages/AntiDumpSlippageDashboard";
import CreatorPage from "@/pages/CreatorPage";
import ProtectedCreatorPortal from "@/components/auth/ProtectedCreatorPortal";
import ProtectedNFTModule from "@/components/auth/ProtectedNFTModule";
import ProtectedRewardsModule from "@/components/auth/ProtectedRewardsModule";
import CookieConsentBanner from "@/components/gdpr/CookieConsentBanner";
import { SecurityTest } from "@/pages/SecurityTest";
function Router() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/getting-started" element={<GettingStarted />} />
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<HumanityCallback />} />
      <Route path="/creators" element={<CreatorPage />} />
      <Route path="/staking" element={<PolStakingPage />} />
      <Route path="/automation" element={<AutomationPage />} />
      <Route path="/content-certificate" element={<ProtectedNFTModule />} />
      <Route path="/pool-health" element={<PoolHealthDashboard />} />
      <Route path="/anti-dump" element={<AntiDumpSlippageDashboard />} />
      <Route path="/certificate" element={<ContentCertificatePage />} />
      <Route path="/certificate/:address" element={<ContentCertificatePage />} />
      <Route path="/pool-debug" element={<PoolDebugger />} />
      <Route path="/citations" element={<ProtectedRewardsModule />} />
      <Route path="/citations/:walletAddress" element={<CitationsByWallet />} />
      <Route path="/security-test" element={<SecurityTest />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID || 'cmn0xgyny01ra0ciijd8kc2kk'; // Fallback if env is missing

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#10b981', // Emerald green to match WebPayback
          logo: '/logo.png', 
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
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
