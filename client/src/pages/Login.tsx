import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-2">
          <img src={APP_LOGO} alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-lg text-slate-900">{APP_TITLE}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-slate-200 shadow-lg">
          <div className="p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src={APP_LOGO} alt="Logo" className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to {APP_TITLE}</h1>
              <p className="text-slate-600">Secure escrow transactions for everyone</p>
            </div>

            {/* Login Options */}
            <div className="space-y-4">
              {/* Email/Password Login */}
              <Button
                asChild
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <a href={loginUrl}>
                  <Mail className="w-4 h-4 mr-2" />
                  Login with Email
                </a>
              </Button>

              {/* Google Login */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-slate-300"
              >
                <a href={loginUrl}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Login with Google
                </a>
              </Button>

              {/* OTP Login */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-slate-300"
              >
                <a href={loginUrl}>
                  <Lock className="w-4 h-4 mr-2" />
                  Login with OTP
                </a>
              </Button>
            </div>

            {/* Divider */}
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-600">Or</span>
              </div>
            </div>

            {/* Sign Up */}
            <p className="text-center text-slate-600 text-sm mb-4">
              Don't have an account?{" "}
              <a href={loginUrl} className="text-blue-600 font-semibold hover:underline">
                Sign up now
              </a>
            </p>

            {/* Terms */}
            <p className="text-center text-xs text-slate-500 mt-6">
              By logging in, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-600">
          <p>&copy; 2024 RekberPay. Secure Escrow for Indonesia.</p>
        </div>
      </div>
    </div>
  );
}
