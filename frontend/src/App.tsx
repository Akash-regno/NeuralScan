import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import ModelLaboratoryPage from './pages/ModelLaboratoryPage';
import MetricsPage from './pages/MetricsPage';
import AboutPage from './pages/AboutPage';
import AIDoctorPage from './pages/AIDoctorPage';
import TreatmentPlanPage from './pages/TreatmentPlanPage';
import ColorBends from './components/ColorBends';
import Aurora from './components/Aurora';

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="relative min-h-screen flex flex-col bg-[#050508] text-slate-100 selection:bg-red-500/20 selection:text-red-300 overflow-x-hidden">
      {/* Landing Page Background: ColorBends */}
      {isHome && (
        <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
          <ColorBends
            colors={['#ff0000']}
            color="#ff0000"
            rotation={90}
            speed={0.2}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            noise={0.12}
            parallax={0.5}
            iterations={1}
            intensity={1.5}
            bandWidth={6}
            transparent={true}
          />
        </div>
      )}

      {/* Other Pages Background: Aurora from React Bits */}
      {!isHome && (
        <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none opacity-60">
          <Aurora
            colorStops={['#000000', '#ff0000', '#ffffff']}
            blend={0.3}
            amplitude={1.0}
            speed={1.2}
          />
        </div>
      )}

      {/* Foreground Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/models" element={<ModelLaboratoryPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/ai-doctor" element={<AIDoctorPage />} />
            <Route path="/treatment-plan" element={<TreatmentPlanPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
