import React, { useState, Component, ErrorInfo, ReactNode, lazy, Suspense } from "react";
import { SalonProvider } from "@/context/SalonContext";
import { MainNavbar } from "@/components/layout/MainNavbar";
import { ToastContainer } from "@/components/ui/Toast";
import { LoginPage } from "@/components/auth/LoginPage";

const Home = lazy(() => import("@/app/page"));

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-white rounded-3xl p-8 max-w-md shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900">Application Notice</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || "An unexpected issue occurred while rendering. Click reload to resume."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
            >
              Reload Salon OS
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function SalonAppContent() {
  // Default to showing the luxury Login page on load
  const [showLoginPage, setShowLoginPage] = useState(true);

  if (showLoginPage) {
    return <LoginPage onLoginSuccess={() => setShowLoginPage(false)} />;
  }

  return (
    <div className="bg-white text-slate-900 min-h-screen flex flex-col font-sans">
      <MainNavbar onLogout={() => setShowLoginPage(true)} />
      <main className="flex-1 w-full bg-slate-50/50">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
            </div>
          }
        >
          <Home />
        </Suspense>
      </main>
      <ToastContainer />
      <footer className="bg-white text-slate-500 text-xs py-6 border-t border-slate-200">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              LAZYMONKEY<span className="text-amber-600 font-sans text-xs">AI</span> SALON OS
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Luxury Salon & Spa Operating System</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-slate-400">
            <span>Multi-Branch: Mumbai Flagship &bull; Beverly Hills &bull; London Mayfair &bull; Dubai Marina</span>
            <span>&copy; 2026 LazyMonkey AI Systems</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <SalonProvider>
        <SalonAppContent />
      </SalonProvider>
    </ErrorBoundary>
  );
}

export default App;
