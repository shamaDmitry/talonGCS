import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

function App() {
  return (
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
