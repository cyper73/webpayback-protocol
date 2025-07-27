import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Download, Trash2, FileX, Edit, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const GDPRDataRequest: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    requestType: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestId, setRequestId] = useState('');
  const { toast } = useToast();

  const requestTypes = [
    { value: 'access', label: 'Data Access Request', icon: Download, description: 'Get a copy of all personal data we hold about you' },
    { value: 'delete', label: 'Data Deletion Request', icon: Trash2, description: 'Request deletion of your personal data (subject to legal obligations)' },
    { value: 'portability', label: 'Data Portability Request', icon: FileX, description: 'Receive your data in machine-readable format' },
    { value: 'rectification', label: 'Data Correction Request', icon: Edit, description: 'Request correction of inaccurate personal data' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.requestType) {
      toast({
        title: "Missing Information",
        description: "Please provide your email and select a request type",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest('/api/gdpr/request', {
        method: 'POST',
        body: formData
      });

      if (response.success) {
        setRequestId(response.requestId);
        setRequestSubmitted(true);
        toast({
          title: "GDPR Request Submitted",
          description: `Request ID: ${response.requestId}. You will receive a response within 30 days.`,
        });
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Failed to submit GDPR request. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requestSubmitted) {
    return (
      <Card className="glass-card border-electric-blue/20">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <h3 className="text-xl font-semibold text-white">GDPR Request Submitted</h3>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 w-full max-w-md">
              <p className="text-sm text-green-400 font-medium">Request ID</p>
              <p className="text-lg font-mono text-white">{requestId}</p>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <p>✅ Your request has been received and is being processed</p>
              <p>📧 You will receive email confirmation shortly</p>
              <p>⏰ Response expected within 30 days (GDPR requirement)</p>
              <p>💬 Contact: <span className="text-electric-blue">cyper73@gmail.com</span> for questions</p>
            </div>
            <Button 
              onClick={() => {setRequestSubmitted(false); setFormData({email: '', requestType: '', details: ''});}}
              variant="outline"
              className="mt-4"
            >
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-electric-blue/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-electric-blue" />
            <CardTitle className="text-xl text-white">GDPR Data Rights</CardTitle>
          </div>
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            EU Compliance
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="font-medium text-blue-400 mb-2">Your Rights Under GDPR</h4>
          <p className="text-sm text-gray-300">
            As a data subject in the European Union, you have specific rights regarding your personal data. 
            Use this form to exercise your rights under the General Data Protection Regulation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              placeholder="your.email@example.com"
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
            <p className="text-xs text-gray-400">
              Must match the email address associated with your WebPayback account
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestType" className="text-gray-300">Request Type</Label>
            <Select value={formData.requestType} onValueChange={(value) => setFormData(prev => ({...prev, requestType: value}))}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select your GDPR request type" />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <type.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-400">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-gray-300">Additional Details (Optional)</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => setFormData(prev => ({...prev, details: e.target.value}))}
              placeholder="Provide any additional information about your request..."
              className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
            />
            <p className="text-xs text-gray-400">
              Optional: Provide specific details about your request or any concerns
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-electric-blue hover:bg-electric-blue/90"
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit GDPR Request'}
          </Button>
        </form>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <h4 className="font-medium text-yellow-400 mb-2">Important Notes</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Identity verification may be required for security purposes</li>
            <li>• Blockchain transaction data cannot be deleted (immutable by design)</li>
            <li>• We will respond within 30 days as required by GDPR Article 12</li>
            <li>• Some data may be retained for legal compliance purposes</li>
            <li>• Contact our DPO at cyper73@gmail.com for complex requests</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GDPRDataRequest;