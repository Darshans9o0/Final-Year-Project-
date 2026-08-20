import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ScannerPage from "./pages/ScannerPage";
import WebsiteAnalysisResult from "./pages/WebsiteAnalysisResult";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route
  path="/website-analysis-result"
  element={<WebsiteAnalysisResult />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;