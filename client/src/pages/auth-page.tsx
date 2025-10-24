import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { LogoIcon } from "@/components/ui/icons";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const search = new URLSearchParams(useSearch());
  const registrationMode = search.get("register") === "true";
  const { user, isLoading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed layout with centered content */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2">
        {/* Centered Form Section - always in the middle */}
        <div className="flex items-center justify-center p-8 md:col-span-2 lg:col-span-1 order-2 md:order-1">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center">
              <Link href="/">
                <a className="flex items-center mb-8">
                  <LogoIcon className="h-10 w-auto text-primary-600" />
                  <span className="ml-2 text-2xl font-bold text-gray-900">SyncroPlan</span>
                </a>
              </Link>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                {registrationMode ? 'Create an Account' : 'Welcome Back'}
              </h2>
              <AuthForm defaultTab={registrationMode ? "register" : "login"} />
            </div>
          </div>
        </div>
        
        {/* Hero Section */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden bg-primary-100 md:col-span-2 lg:col-span-1 order-1 md:order-2">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-900 opacity-90"></div>
          <div className="relative h-full w-full flex flex-col justify-center items-center p-12 text-center text-white z-10">
            <h1 className="text-4xl font-bold mb-6">Welcome to SyncroPlan</h1>
            <p className="text-xl mb-8 max-w-md">
              Your Ultimate Academic and Personal Schedule Manager
            </p>
            <div className="space-y-6 max-w-md">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-left">
                  Sync your academic timetable with personal tasks seamlessly
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-left">
                  Color-coded schedules for quick identification of commitments
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-left">
                  Smart reminders to keep you on track with all your commitments
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-primary-900 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
