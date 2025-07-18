import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Crown, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Creator } from "@shared/schema";

interface ReferralInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ReferralInput({ value, onChange, disabled = false }: ReferralInputProps) {
  const [referralCode, setReferralCode] = useState(value);
  const [validating, setValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [referrer, setReferrer] = useState<Creator | null>(null);
  const { toast } = useToast();

  // Validate referral code with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (referralCode && referralCode.length >= 6) {
        validateReferralCode(referralCode);
      } else {
        setIsValid(null);
        setReferrer(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [referralCode]);

  const validateReferralCode = async (code: string) => {
    setValidating(true);
    try {
      const creator = await apiRequest(`/api/creators/referral/${code}`);
      setIsValid(true);
      setReferrer(creator);
      onChange(code);
    } catch (error) {
      setIsValid(false);
      setReferrer(null);
    } finally {
      setValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setReferralCode(code);
    
    if (!code) {
      setIsValid(null);
      setReferrer(null);
      onChange("");
    }
  };

  const getInputState = () => {
    if (!referralCode) return "default";
    if (validating) return "validating";
    if (isValid === true) return "valid";
    if (isValid === false) return "invalid";
    return "default";
  };

  const getStatusIcon = () => {
    const state = getInputState();
    switch (state) {
      case "valid":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "invalid":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "validating":
        return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    const state = getInputState();
    switch (state) {
      case "valid":
        return "border-green-500";
      case "invalid":
        return "border-red-500";
      default:
        return "";
    }
  };

  // Check URL params for referral code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && !value) {
      setReferralCode(refCode);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="referralCode">
          Referral Code (Optional)
          <span className="text-sm text-gray-400 ml-2">
            Get bonus rewards when referred by existing creators
          </span>
        </Label>
        <div className="relative">
          <Input
            id="referralCode"
            placeholder="Enter referral code (e.g., WPT00001)"
            value={referralCode}
            onChange={handleInputChange}
            disabled={disabled}
            className={`font-mono pr-10 ${getBorderColor()}`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getStatusIcon()}
          </div>
        </div>
        
        {isValid === false && (
          <p className="text-sm text-red-400">
            Invalid referral code. Please check and try again.
          </p>
        )}
      </div>

      {/* Referrer Information */}
      {referrer && isValid && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <CardTitle className="text-green-400 text-sm">Valid Referral Code</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Referred by:</span>
                <Badge variant="outline" className="bg-green-500/20 text-green-300">
                  {referrer.referralCode}
                </Badge>
                {referrer.isEarlyAdopter && (
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Early Adopter
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Gift className="w-4 h-4" />
                <span>Website: {referrer.websiteUrl}</span>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-sm text-green-400 font-medium">Referral Benefits:</p>
                <ul className="text-sm text-gray-300 mt-1 space-y-1">
                  <li>• You'll receive priority support during verification</li>
                  <li>• Your referrer will receive WPT token rewards</li>
                  {referrer.isEarlyAdopter && (
                    <li>• Enhanced rewards from Early Adopter referrer</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits Information */}
      {!referralCode && (
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-400 text-sm">Referral Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• Get referred by existing creators for priority support</p>
              <p>• Help your referrer earn WPT token rewards</p>
              <p>• Early Adopter referrers provide enhanced benefits</p>
              <p>• Build connections within the WebPayback community</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}