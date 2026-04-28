import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import { Demo } from "@/components/Demo";

function App() {
  return (
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<Demo />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
