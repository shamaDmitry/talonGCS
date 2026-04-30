import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import DemoPage from "@/pages/DemoPage";
import { ThemeProvider, themes } from "@/components/theme-provider";
import { Toaster as Sonner } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeProvider defaultTheme={themes.dark} storageKey="vite-ui-theme">
      <StrictMode>
        <Sonner position="top-center" />

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={<DemoPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </StrictMode>
    </ThemeProvider>
  );
}

export default App;
