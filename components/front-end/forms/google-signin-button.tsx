"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GoogleSignInButtonProps {
  clientId: string;
  redirectUri: string;
}

export function GoogleSignInButton({ clientId, redirectUri }: GoogleSignInButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      googleAuthUrl.searchParams.set("client_id", clientId);
      googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
      googleAuthUrl.searchParams.set("response_type", "code");
      googleAuthUrl.searchParams.set("scope", "openid email profile");
      googleAuthUrl.searchParams.set("prompt", "select_account");

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        googleAuthUrl.toString(),
        "Google Sign In",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        toast.error("Failed to open Google sign-in window", {
          description: "Please allow popups for this site"
        });
        setIsLoading(false);
        return;
      }

      const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            resolve({ success: false, error: "Sign in was cancelled" });
          }
        }, 500);

        window.addEventListener("message", async (event) => {
          if (event.origin !== window.location.origin) return;

          clearInterval(checkClosed);
          popup.close();

          if (event.data?.type === "google-auth-error") {
            resolve({ success: false, error: event.data.error });
            return;
          }

          if (event.data?.type === "google-auth" && event.data.code) {
            try {
              const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: event.data.code }),
              });

              const data = await res.json();

              if (res.ok && data.success) {
                toast.success("Google sign-in successful!", {
                  description: "Welcome to Flickerplay"
                });
                
                if (data.data?.user?.role === "SUPER_ADMIN" || 
                    data.data?.user?.role === "ADMIN" || 
                    data.data?.user?.role === "MANAGER") {
                  router.push("/dashboard");
                } else {
                  router.push("/");
                }
                router.refresh();
                resolve({ success: true });
              } else {
                resolve({ 
                  success: false, 
                  error: data.error || "Google sign-in failed. Please try again." 
                });
              }
            } catch (error: any) {
              resolve({ 
                success: false, 
                error: error.message || "Google sign-in failed. Please try again." 
              });
            }
          }
        });
      });

      if (!result.success && result.error) {
        toast.error(result.error, {
          description: "Please try again."
        });
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to initiate Google sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-transparent"
      disabled={isLoading}
      onClick={handleGoogleSignIn}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      Google
    </Button>
  );
}
