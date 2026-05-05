import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useHumanity } from "@humanity-org/react-sdk";

export default function HumanityCallback() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useHumanity();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    navigate("/login", { replace: true });
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
      <div className="flex items-center gap-3 text-gray-300">
        <Loader2 className="h-6 w-6 animate-spin text-electric-blue" />
        <span>Completing sign-in...</span>
      </div>
    </div>
  );
}
