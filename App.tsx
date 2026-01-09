import React, { useState, useEffect } from 'react';
import { CalculatorInputs, SimulationHistory, UserProfile, NicheData } from './types.ts';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthGate } from './components/AuthGate.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Boutique } from './components/Boutique.tsx';
import { UserDashboard } from './components/UserDashboard.tsx';
import { MasterclassLanding } from './components/MasterclassLanding.tsx';
import { MasterclassSuccess } from './components/MasterclassSuccess.tsx';
import { AuthService, AdminService, AuditService } from './services/storage.ts';

export const NICHE_DATA: NicheData[] = [
  { id: 'fashion', label: 'Vêtements / Mode', benchmarkRoas: 2.8, benchmarkCtr: 1.1 },
  { id: 'beauty', label: 'Cosmétiques / Beauté', benchmarkRoas: 3.1, benchmarkCtr: 1.4 },
  { id: 'info', label: 'Infopreneuriat / Coaching', benchmarkRoas: 1.8, benchmarkCtr: 0.8 },
  { id: 'tech', label: 'High-Tech / Gadgets', benchmarkRoas: 2.5, benchmarkCtr: 0.9 },
  { id: 'realestate', label: 'Services / Immobilier', benchmarkRoas: 1.5, benchmarkCtr: 0.5 },
  { id: 'food', label: 'Alimentaire / Boissons', benchmarkRoas: 2.2, benchmarkCtr: 1.0 },
  { id: 'home', label: 'Maison / Décoration', benchmarkRoas: 2.6, benchmarkCtr: 1.0 },
  { id: 'saas', label: 'Logiciels / SaaS B2C', benchmarkRoas: 2.0, benchmarkCtr: 1.2 },
  { id: 'finance', label: 'Services Financiers', benchmarkRoas: 1.5, benchmarkCtr: 0.7 },
  { id: 'other', label: 'Autres / Non Spécifié', benchmarkRoas: 2.0, benchmarkCtr: 0.9 },
];

type AppMode = 'home' | 'admin_dashboard' | 'boutique' | 'user_dashboard' | 'masterclass' | 'success';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) return 'success';
    return 'home';
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(AuthService.getCurrentUser());
  const [latestAudit, setLatestAudit] = useState<SimulationHistory | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('adspilot_theme') as 'dark' | 'light') || 'dark');

  useEffect(() => {
    localStorage.setItem('adspilot_theme', theme);
    // Exposer setAppMode pour les composants enfants
    // @ts-ignore
    window.setAppMode = setAppMode;
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      AuditService.getAuditHistory(currentUser.id).then(history => {
        if (history.length > 0) setLatestAudit(history[0]);
      });
    }
  }, [currentUser]);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setAppMode('home');
  };

  const handleAuthenticated = (user: UserProfile) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    setAppMode(user.role === 'admin' ? 'admin_dashboard' : 'user_dashboard');
  };

  const renderContent = () => {
    if (appMode === 'home') return (
      <LandingPage 
        onStart={() => currentUser ? setAppMode('user_dashboard') : setShowAuthModal(true)} 
        onBoutique={() => setAppMode('boutique')} 
        onLogin={() => setShowAuthModal(true)} 
        currentUser={currentUser} 
        onDashboard={() => setAppMode(currentUser?.role === 'admin' ? 'admin_dashboard' : 'user_dashboard')} 
      />
    );
    if (appMode === 'success') return (
      <MasterclassSuccess 
        onContinue={() => {
          // Recharger le profil pour être sûr d'avoir has_andromeda_access: true
          const updated = AuthService.getCurrentUser();
          setCurrentUser(updated);
          setAppMode('user_dashboard');
          // Déclencher le switch vers l'onglet académie
          setTimeout(() => {
             window.dispatchEvent(new CustomEvent('setDashboardTab', { detail: 'academy' }));
          }, 100);
        }} 
      />
    );
    if (appMode === 'masterclass') return (
      <MasterclassLanding 
        onBack={() => setAppMode(currentUser ? 'user_dashboard' : 'home')} 
        onJoin={() => {
          // handleJoin est maintenant géré à l'intérieur de MasterclassLanding via redirection directe
        }}
      />
    );
    if (appMode === 'admin_dashboard' && currentUser) return <AdminDashboard adminUser={currentUser} onLogout={handleLogout} />;
    if (appMode === 'user_dashboard' && currentUser) return (
      <UserDashboard 
        user={currentUser} 
        latestAudit={latestAudit} 
        onNewAudit={() => {}} 
        onLogout={handleLogout} 
        onConsulting={() => {}} 
        onNotification={showNotification} 
        theme={theme} 
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} 
      />
    );
    if (appMode === 'boutique') return <Boutique onNotification={showNotification} onBack={() => setAppMode(currentUser ? 'user_dashboard' : 'home')} />;
    return null;
  };

  const isScrollLocked = appMode === 'user_dashboard' || appMode === 'admin_dashboard';

  return (
    <div className={`relative flex flex-col ${isScrollLocked ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto'} ${appMode === 'user_dashboard' ? (theme === 'dark' ? 'bg-[#050505]' : 'bg-[#F8F9FA]') : 'bg-slate-50'}`}>
      {toast && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-2xl bg-slate-900 text-white border border-slate-700 animate-fade-in flex items-center gap-4 shadow-2xl"><span className="font-black text-[11px] uppercase tracking-widest">{toast.msg}</span></div>}
      {showAuthModal && <AuthGate onAuthenticated={handleAuthenticated} onCancel={() => setShowAuthModal(false)} />}
      {renderContent()}
    </div>
  );
}