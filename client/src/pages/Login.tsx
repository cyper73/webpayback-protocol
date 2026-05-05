import { useEffect } from "react";
import { HumanityConnect, HumanityErrorBoundary, useAuth, useVerification } from "@humanity-org/react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Shield, Sparkles, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { toast } = useToast();
  const { isLoading, isAuthenticated, user, logout } = useAuth();
  const {
    verify,
    isLoading: isVerifying,
    status: verificationStatus,
    result: verificationResult,
    error: verificationError,
    reset: resetVerification,
  } = useVerification();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const walletAddress =
      (user as any)?.walletAddress ||
      (user as any)?.wallet?.address ||
      (user as any)?.evmAddress ||
      "";

    if (!walletAddress) {
      return;
    }

    const session = {
      walletAddress,
      loginTime: new Date().toISOString(),
      isAuthenticated: true,
    };

    localStorage.setItem("webpayback_session", JSON.stringify(session));
    window.dispatchEvent(new CustomEvent("webpayback-login", { detail: session }));
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (verificationError) {
      toast({
        title: "Verification error",
        description: verificationError.message || "Humanity verification failed.",
        variant: "destructive",
      });
    }
  }, [verificationError, toast]);

  useEffect(() => {
    if (verificationStatus !== "success" || !verificationResult) {
      return;
    }

    const sessionRaw = localStorage.getItem("webpayback_session");
    if (!sessionRaw) {
      return;
    }

    let session: any = null;
    try {
      session = JSON.parse(sessionRaw);
    } catch {
      return;
    }

    const creatorId = Number(session?.creatorId);
    const bearerToken = session?.token;
    if (!Number.isFinite(creatorId) || creatorId <= 0 || !bearerToken) {
      return;
    }

    const isVerified = Boolean((verificationResult as any)?.verified);
    const scoreCandidate =
      Number((verificationResult as any)?.score) ||
      Number((verificationResult as any)?.humanityScore) ||
      Number((verificationResult as any)?.result?.score) ||
      0;
    const score = Number.isFinite(scoreCandidate) ? scoreCandidate : 0;
    const credentialId =
      (verificationResult as any)?.credentialId ||
      (verificationResult as any)?.result?.credentialId ||
      null;

    (async () => {
      try {
        const response = await fetch("/api/humanity/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({
            userId: creatorId,
            isVerified,
            score,
            credentialId,
          }),
        });

        if (!response.ok) {
          return;
        }

        toast({
          title: "Verification synced",
          description: "Your Humanity status was persisted to backend state.",
        });
      } catch {
        return;
      }
    })();
  }, [verificationStatus, verificationResult, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-electric-blue/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="text-center space-y-4 relative z-10">
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-10 w-10 text-electric-blue" />
              <h1 className="text-3xl font-bold text-white tracking-tight">WebPayback Protocol</h1>
            </div>
            <p className="text-md text-gray-400 max-w-md mx-auto">
              Sign in using the official Humanity SDK redirect flow.
            </p>
          </div>
          <Card className="border-gray-800 bg-black/60 backdrop-blur-xl relative z-10">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-electric-blue/10 p-4 rounded-full mb-2">
                  <Shield className="h-10 w-10 text-electric-blue" />
                </div>
                <h3 className="text-xl font-medium text-white text-center">Prove Your Humanity</h3>
                <div className="w-full flex justify-center">
                  <HumanityErrorBoundary
                    fallback={(error, reset) => (
                      <div className="text-center space-y-3">
                        <p className="text-sm text-red-400">
                          Authentication unavailable: {error.message}
                        </p>
                        <Button
                          onClick={reset}
                          variant="outline"
                          className="border-gray-700 hover:bg-gray-800 text-gray-300"
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                    onError={(error) => {
                      toast({
                        title: "Authentication error",
                        description: error.message || "Unable to initialize Humanity sign-in.",
                        variant: "destructive",
                      });
                    }}
                  >
                    <HumanityConnect
                      mode="redirect"
                      scopes={["openid", "identity:read"]}
                      variant="primary"
                      size="md"
                      label="Sign in with Humanity"
                      onError={(error) => {
                        if (error.code === "access_denied") {
                          toast({
                            title: "Sign-in cancelled",
                            description: "You denied the Humanity consent screen.",
                            variant: "destructive",
                          });
                          return;
                        }

                        if (error.code === "popup_blocked") {
                          toast({
                            title: "Popup blocked",
                            description: "Enable popups or continue with redirect mode.",
                            variant: "destructive",
                          });
                          return;
                        }

                        toast({
                          title: "Sign-in failed",
                          description: error.message || "Humanity login failed. Please retry.",
                          variant: "destructive",
                        });
                      }}
                    />
                  </HumanityErrorBoundary>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="border-gray-800 bg-black/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-6 w-6" />
              Humanity SDK Session Active
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium text-white">You are authenticated with Humanity SDK.</p>
              <p className="text-sm text-gray-400">
                Run a quick verification to sync your human-proof state for rewards.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Verification Result</p>
                <Badge className="bg-electric-blue/20 text-electric-blue border-none">
                  {verificationResult?.verified ? "Verified" : "Pending"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => verify("is_human")}
                disabled={isVerifying}
                className="flex-1 bg-electric-blue hover:bg-electric-blue/80 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isVerifying ? "Verifying..." : "Verify is_human"}
              </Button>
              <Button
                onClick={() => resetVerification()}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                Re-check
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  window.location.href = "/creators";
                }}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white"
              >
                Go to Creator Portal
              </Button>
              <Button
                onClick={async () => {
                  await logout();
                  localStorage.removeItem("webpayback_session");
                  window.dispatchEvent(new CustomEvent("webpayback-logout"));
                }}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
