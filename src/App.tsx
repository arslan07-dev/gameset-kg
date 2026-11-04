import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { SearchModal } from './components/common/SearchModal';
import { SavedSettingsModal } from './components/common/SavedSettingsModal';
import { ProMembershipModal } from './components/common/ProMembershipModal';

import { HomePage } from './pages/HomePage';
import { GamesPage } from './pages/GamesPage';
import { FreeFirePage } from './pages/FreeFirePage';
import { PubgMobilePage } from './pages/PubgMobilePage';
import { MobileLegendsPage } from './pages/MobileLegendsPage';
import { CodMobilePage } from './pages/CodMobilePage';
import { DevicesPage } from './pages/DevicesPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { PerformanceGuidePage } from './pages/PerformanceGuidePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ComparePage } from './pages/ComparePage';
import { SubmitSettingsPage } from './pages/SubmitSettingsPage';
import { AdminPage } from './pages/AdminPage';

import { AnnouncementBanner } from './components/common/AnnouncementBanner';

export default function App() {
  return (
    <LanguageProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-[#05070A] text-slate-100">
            <Navbar />
            <AnnouncementBanner />

            <main className="flex-1 w-full max-w-full overflow-x-hidden">
              <Routes>
                {/* 1. Home */}
                <Route path="/" element={<HomePage />} />

                {/* 2. Games Catalog */}
                <Route path="/games" element={<GamesPage />} />

                {/* 3. Free Fire */}
                <Route path="/games/free-fire" element={<FreeFirePage />} />

                {/* 4. PUBG Mobile (both /games/pubg and /games/pubg-mobile) */}
                <Route path="/games/pubg" element={<PubgMobilePage />} />
                <Route path="/games/pubg-mobile" element={<PubgMobilePage />} />

                {/* 5. Mobile Legends */}
                <Route path="/games/mobile-legends" element={<MobileLegendsPage />} />

                {/* 6. Call of Duty Mobile (both /games/call-of-duty and /games/cod-mobile) */}
                <Route path="/games/call-of-duty" element={<CodMobilePage />} />
                <Route path="/games/cod-mobile" element={<CodMobilePage />} />

                {/* 7. Devices Database */}
                <Route path="/devices" element={<DevicesPage />} />

                {/* 8. Settings Generator */}
                <Route path="/generator" element={<GeneratorPage />} />

                {/* 9. Guides & Performance (both /guides and /performance-guide) */}
                <Route path="/guides" element={<PerformanceGuidePage />} />
                <Route path="/performance-guide" element={<PerformanceGuidePage />} />

                {/* 10. About */}
                <Route path="/about" element={<AboutPage />} />

                {/* 11. Contact */}
                <Route path="/contact" element={<ContactPage />} />

                {/* 12. Compare Tool */}
                <Route path="/compare" element={<ComparePage />} />

                {/* 13. Submit Settings */}
                <Route path="/submit" element={<SubmitSettingsPage />} />

                {/* 14. Admin Panel */}
                <Route path="/admin" element={<AdminPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />

            {/* Global Modals */}
            <SearchModal />
            <SavedSettingsModal />
            <ProMembershipModal />
          </div>
        </BrowserRouter>
      </FavoritesProvider>
    </LanguageProvider>
  );
}
