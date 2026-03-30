// Simplified English-only translations for better stability and international understanding
export const translations = {
  webpaybackProtocol: "WebPayback Protocol",
  systemActive: "System Active",
  syncing: "Syncing...",
  tokenLive: "WPT Token Live",
  
  creatorRegistration: "Creator Registration Portal",
  websiteUrl: "Website URL",
  websiteUrlPlaceholder: "https://your-website.com",
  contentCategory: "Content Category",
  selectCategory: "Select category",
  walletAddress: "Wallet Address",
  walletPlaceholder: "0x...",
  agreeToTerms: "I agree to the WebPayback Protocol Terms",
  registerForWebpayback: "Register for WebPayback",
  
  recentCreatorRewards: "Recent Creator Rewards",
  creator: "Creator",
  status: "Status",
  completed: "completed",
  pending: "pending",
  totalRewardsToday: "Total Rewards Today",
  
  multiAgentOrchestration: "Multi-Agent Orchestration Command Center",
  live: "Live",
  
  technology: "Technology",
  finance: "Finance", 
  entertainment: "Entertainment",
  education: "Education",
  news: "News",
  
  active: "Active",
  inactive: "Inactive",
  
  loading: "Loading...",
  error: "Error",
  success: "Success",
  
  antiFraudSystem: "Anti-Fraud System",
  fraudAlerts: "Fraud Alerts",
  networkSwitcher: "Network Switcher",
  
  fraudWarning: "SMART GUYS WARNING:",
  fraudWarningText: "WebPayback system implements advanced anti-fraud controls. Attempts at sybil attacks, auto-farming or system manipulation will result in:",
  fraudWarning1: "Immediate reward blocking",
  fraudWarning2: "Permanent reputation score reduction",
  fraudWarning3: "Possible account suspension or ban",
  fraudWarning4: "Intensive monitoring of future activities",
  activeFraudRules: "Active Anti-Fraud Rules",
  activeFraudAlerts: "Active Fraud Alerts",
  fraudAlertsHistory: "Fraud Alerts History",
  activeAlerts: "Active Alerts",
  resolvedAlerts: "Resolved Alerts",
  reasons: "Reasons",
  recommendedAction: "Recommended Action",
  maxDailyAccessesDomain: "Max daily accesses per domain",
  maxDailyAccessesIP: "Max daily accesses per IP",
  maxDomainConcentration: "Max domain concentration",
  maxIPConcentration: "Max IP concentration",
  minAIModelDiversity: "Min AI model diversity",
  minEntropyScore: "Min entropy score",
  maxIdenticalRequests: "Max identical requests",
  minTimeSpread: "Min time distribution"
};

// Default translation function for components
export function getTranslation(key: string): string {
  return translations[key as keyof typeof translations] || key;
}