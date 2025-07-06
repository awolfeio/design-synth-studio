import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import RootLayout from "./components/Layout/RootLayout";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ColorSystem = lazy(() => import("./pages/ColorSystem"));
const Typography = lazy(() => import("./pages/Typography"));
const Spacing = lazy(() => import("./pages/Spacing"));
const BorderRadius = lazy(() => import("./pages/BorderRadius"));
const Shadow = lazy(() => import("./pages/Shadow"));
const Preview = lazy(() => import("./pages/Preview"));
const Icons = lazy(() => import("./pages/Icons"));
const AliasTokens = lazy(() => import("./pages/AliasTokens"));

const queryClient = new QueryClient();

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// ScrollToTop component that scrolls to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  // Set basename for GitHub Pages deployment
  const basename = import.meta.env.PROD ? '/design-synth-studio' : '';
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300} skipDelayDuration={100}>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basename}>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<RootLayout><Index /></RootLayout>} />
              <Route path="/colors" element={<RootLayout><ColorSystem /></RootLayout>} />
              <Route path="/typography" element={<RootLayout><Typography /></RootLayout>} />
              <Route path="/spacing" element={<RootLayout><Spacing /></RootLayout>} />
              <Route path="/border-radius" element={<RootLayout><BorderRadius /></RootLayout>} />
              <Route path="/shadow" element={<RootLayout><Shadow /></RootLayout>} />
              <Route path="/icons" element={<RootLayout><Icons /></RootLayout>} />
              <Route path="/aliases" element={<RootLayout><AliasTokens /></RootLayout>} />
              <Route path="/preview" element={<RootLayout><Preview /></RootLayout>} />
              <Route path="*" element={<RootLayout><NotFound /></RootLayout>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
