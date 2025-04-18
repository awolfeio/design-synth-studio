
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ColorSystem from "./pages/ColorSystem";
import Typography from "./pages/Typography";
import RootLayout from "./components/Layout/RootLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout><Index /></RootLayout>} />
          <Route path="/colors" element={<RootLayout><ColorSystem /></RootLayout>} />
          <Route path="/typography" element={<RootLayout><Typography /></RootLayout>} />
          <Route path="*" element={<RootLayout><NotFound /></RootLayout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
