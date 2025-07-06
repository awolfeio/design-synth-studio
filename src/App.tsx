import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ColorSystem from "./pages/ColorSystem";
import Typography from "./pages/Typography";
import Preview from "./pages/Preview";
import Icons from "./pages/Icons";
import RootLayout from "./components/Layout/RootLayout";

const queryClient = new QueryClient();

// ScrollToTop component that scrolls to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<RootLayout><Index /></RootLayout>} />
          <Route path="/colors" element={<RootLayout><ColorSystem /></RootLayout>} />
          <Route path="/typography" element={<RootLayout><Typography /></RootLayout>} />
          <Route path="/icons" element={<RootLayout><Icons /></RootLayout>} />
          <Route path="/preview" element={<RootLayout><Preview /></RootLayout>} />
          <Route path="*" element={<RootLayout><NotFound /></RootLayout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
