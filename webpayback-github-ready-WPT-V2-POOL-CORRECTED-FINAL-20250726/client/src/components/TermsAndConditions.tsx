import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, FileText, AlertTriangle, Gavel } from "lucide-react";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-electric-blue" />
            <h1 className="text-4xl font-bold gradient-text">Terms and Conditions</h1>
          </div>
          <p className="text-gray-400 text-lg">
            WebPayback Protocol - Last updated: January 19, 2025
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          {/* Overview */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Service Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                WebPayback Protocol is a decentralized application (dApp) that automatically rewards content creators 
                when AI systems access their work, provides AI agent orchestration, blockchain deployment capabilities, 
                and facilitates WPT token distribution on supported networks.
              </p>
              <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-lg p-4">
                <p className="text-sm text-electric-blue">
                  By using our platform, you agree to these terms and our enterprise-grade security standards.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Terms */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gavel className="h-5 w-5 text-yellow-500" />
                <span>Key Terms & Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-electric-blue mb-2">Eligibility Requirements</h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>Must be at least 18 years old</li>
                      <li>Must have legal capacity to enter contracts</li>
                      <li>Must comply with all applicable laws</li>
                    </ul>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div>
                    <h4 className="font-semibold text-electric-blue mb-2">Creator Responsibilities</h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>Must own or have legitimate rights to registered content</li>
                      <li>Responsible for maintaining accurate wallet addresses</li>
                      <li>Must not engage in fraudulent activities</li>
                      <li>Should report suspected abuse promptly</li>
                    </ul>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div>
                    <h4 className="font-semibold text-electric-blue mb-2">Token Economics</h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>WPT tokens distributed for legitimate AI access</li>
                      <li>Rewards subject to verification and fraud detection</li>
                      <li>0.1% sustainability fee for platform operations</li>
                      <li>Gas pool system minimizes transaction costs</li>
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Security & Compliance */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <span>Security & Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-purple-400 mb-3">Enterprise-Grade Security Measures:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
                    <p className="text-sm text-purple-300 font-medium">CSRF Protection</p>
                    <p className="text-xs text-gray-400">Cross-Site Request Forgery prevention</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
                    <p className="text-sm text-purple-300 font-medium">XSS Prevention</p>
                    <p className="text-xs text-gray-400">Cross-Site Scripting protection</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
                    <p className="text-sm text-purple-300 font-medium">IDOR Protection</p>
                    <p className="text-xs text-gray-400">Insecure Direct Object Reference prevention</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
                    <p className="text-sm text-purple-300 font-medium">Reentrancy Protection</p>
                    <p className="text-xs text-gray-400">Smart contract attack prevention</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">Fraud Detection Active</p>
                    <p className="text-xs text-gray-400">
                      Automated systems monitor for suspicious activity. Users engaging in fraudulent behavior 
                      will be permanently banned and may face legal action.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Disclaimers */}
          <Card className="glass-card border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <span>Important Disclaimers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
                <h4 className="font-semibold text-red-400 mb-2">Financial Risks</h4>
                <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                  <li>WPT tokens may fluctuate in value and may become worthless</li>
                  <li>Blockchain networks may experience technical issues</li>
                  <li>Smart contract bugs or exploits could affect functionality</li>
                  <li>Participate only with funds you can afford to lose</li>
                </ul>
              </div>
              
              <div className="bg-gray-500/10 border border-gray-500/20 rounded p-4">
                <h4 className="font-semibold text-gray-400 mb-2">Limitation of Liability</h4>
                <p className="text-sm text-gray-300">
                  WebPayback Protocol's total liability shall not exceed the value of tokens earned 
                  by the affected user in the 30 days preceding any claim. The platform is not liable 
                  for blockchain network failures, user errors, or token value fluctuations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="glass-card border-electric-blue/20">
            <CardHeader>
              <CardTitle className="text-electric-blue">Contact & Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-electric-blue/10 border border-electric-blue/20 rounded p-4">
                  <p className="font-medium text-electric-blue">Technical Support</p>
                  <a href="mailto:cyper73@gmail.com" className="text-sm text-gray-400 hover:text-white">
                    cyper73@gmail.com
                  </a>
                </div>
                <div className="bg-electric-blue/10 border border-electric-blue/20 rounded p-4">
                  <p className="font-medium text-electric-blue">Legal Inquiries</p>
                  <a href="mailto:cyper73@gmail.com" className="text-sm text-gray-400 hover:text-white">
                    cyper73@gmail.com
                  </a>
                </div>
                <div className="bg-electric-blue/10 border border-electric-blue/20 rounded p-4">
                  <p className="font-medium text-electric-blue">Privacy Concerns</p>
                  <a href="mailto:cyper73@gmail.com" className="text-sm text-gray-400 hover:text-white">
                    cyper73@gmail.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            © 2025 WebPayback Protocol. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Revolutionizing AI-Creator Compensation Through Blockchain Technology
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;