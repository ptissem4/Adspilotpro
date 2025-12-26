
import React from 'react';
import { Logo } from './Logo';
import { MockupCockpit, MockupAnalysis, MockupVerdict } from './UIPreviewMockups';
import { UserProfile } from '../types';
import { CaseStudies } from './CaseStudies';

interface LandingPageProps {
  onStart: () => void;
  onBoutique: () => void;
  onLogin: () => void;
  onDashboard: () => void;
  currentUser: UserProfile | null;
  newLeadsCount?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onBoutique, onLogin, onDashboard, currentUser, newLeadsCount = 0 }) => {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-white selection:bg-indigo-100 scroll-smooth">
      
      {/* HEADER NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full h-24 z-[100] px-6 md:px-12 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100">
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer" />
        <div className="flex items-center gap-3 md:gap-8">
          <button 
            onClick={() => document.getElementById('expertise')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Pourquoi l'Audit ?
          </button>
          <button 
            onClick={() => document.getElementById('etudes-de-cas')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Études de Cas
          </button>
          <button 
            onClick={onBoutique}
            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-slate-900 transition-colors bg-indigo-50 px-4 py-2 rounded-lg"
          >
            Boutique
          </button>
          {currentUser ? (
            <button 
              onClick={onDashboard}
              className="bg-indigo-600 text-white px-5 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2 relative"
            >
              <span className="hidden sm:inline">{currentUser.role === 'admin' ? '👑 Admin Panel' : '👤 Mon Espace'}</span>
              <span className="sm:hidden">{currentUser.role === 'admin' ? '👑' : '👤'}</span>
              {currentUser.role === 'admin' && newLeadsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm animate-bounce"></span>
              )}
            </button>
          ) : (
            <button 
              onClick={onLogin}
              className="bg-white text-slate-900 border border-slate-200 px-5 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              Connexion
            </button>
          )}
        </div>
      </nav>

      {/* 1. SECTION HERO (H1 SEO) */}
      <section className="relative pt-48 pb-24 overflow-hidden border-b border-slate-100 bg-gradient-to-b from-indigo-50/20 to-white">
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
           <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-fade-in">
              Diagnostic Stratégique Meta v5.2
           </div>
           <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.95] animate-fade-in italic uppercase">
             Arrêtez de piloter vos <br/>
             <span className="text-indigo-600">
                Meta Ads à l'aveugle.
             </span>
           </h1>
           <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium animate-fade-in delay-100 italic">
             Obtenez un <span className="text-slate-900 font-black underline decoration-indigo-300 decoration-4">audit chirurgical</span> par AdsPilot Pro. Découvrez vos angles morts techniques et débloquez votre prochain palier de scaling.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in delay-200">
              <button 
                onClick={onStart}
                className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-black text-white transition-all duration-300 bg-slate-900 rounded-[2rem] hover:bg-indigo-600 shadow-2xl shadow-indigo-600/30 hover:-translate-y-1 active:scale-95"
              >
                Lancer mon Diagnostic &rarr;
              </button>
              <button 
                onClick={onBoutique}
                className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-black text-slate-900 transition-all duration-300 bg-white border border-slate-200 rounded-[2rem] hover:bg-slate-50 shadow-xl hover:-translate-y-1 active:scale-95"
              >
                Visiter la Boutique
              </button>
           </div>
        </div>

        {/* MOCKUPS VISUELS D'ILLUSTRATION */}
        <div className="max-w-6xl mx-auto px-6 mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in delay-300">
           <MockupCockpit />
           <MockupAnalysis />
           <MockupVerdict />
        </div>
      </section>

      {/* 2. SECTION EXPERTISE (H2 SEO) */}
      <section id="expertise" className="py-24 max-w-6xl mx-auto px-6 space-y-32">
        
        {/* SOUS-SECTION: L'IA ANDROMEDA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-slate-900 leading-[0.9]">
                L'IA <span className="text-indigo-600">Andromeda.</span>
              </h2>
              <div className="h-1.5 w-24 bg-indigo-600 rounded-full"></div>
              <p className="text-lg text-slate-500 font-medium italic leading-relaxed">
                Andromeda est le nom de code de l'IA prédictive de Meta (Advantage+). Elle ne choisit plus vos clients par intérêts, mais par le <strong>signal de conversion</strong> envoyé par votre site.
              </p>
              <p className="text-slate-500 font-medium leading-relaxed">
                Si votre signal est pur, l'IA identifie vos futurs clients avec une précision chirurgicale. Si votre signal est bruité, elle gaspille votre budget sur des audiences froides.
              </p>
           </div>
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10"><span className="text-8xl">⚡</span></div>
              <h4 className="text-xl font-black uppercase tracking-widest text-indigo-400 mb-6 italic">Architecture Signal</h4>
              <ul className="space-y-4">
                 <li className="flex gap-4 items-center">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-black">1</div>
                    <p className="text-sm font-bold uppercase tracking-tight">Installation CAPI Server-Side</p>
                 </li>
                 <li className="flex gap-4 items-center">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-black">2</div>
                    <p className="text-sm font-bold uppercase tracking-tight">Nettoyage du Flux Data (GTM)</p>
                 </li>
                 <li className="flex gap-4 items-center">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-black">3</div>
                    <p className="text-sm font-bold uppercase tracking-tight">Score EMQ &gt; 8/10 Requis</p>
                 </li>
              </ul>
           </div>
        </div>

        {/* SOUS-SECTION: LE PIXEL AVEUGLE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="order-2 lg:order-1 relative group">
              <div className="absolute -inset-4 bg-red-500/10 rounded-[4rem] blur-xl group-hover:bg-red-500/20 transition-all"></div>
              <div className="relative bg-white border border-red-100 rounded-[3.5rem] p-12 text-center space-y-6 shadow-xl">
                 <div className="text-6xl">🌑</div>
                 <h4 className="text-3xl font-black text-red-600 uppercase italic tracking-tighter">Diagnostic : Signal Critique</h4>
                 <p className="text-slate-500 italic font-medium leading-relaxed">
                   "Sans l'API de Conversion, Meta perd 70% de sa visibilité sur vos acheteurs depuis iOS14. Vous payez le plein tarif pour un ciblage à moitié efficace."
                 </p>
              </div>
           </div>
           <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-slate-900 leading-[0.9]">
                Le Pixel <span className="text-red-500">Aveugle.</span>
              </h2>
              <div className="h-1.5 w-24 bg-red-500 rounded-full"></div>
              <p className="text-lg text-slate-500 font-medium italic leading-relaxed">
                Le tracking navigateur classique est mort. Si vous n'utilisez pas l'API de Conversion (CAPI), votre CPA est gonflé artificiellement de 20% à 40%.
              </p>
              <button 
                onClick={onStart}
                className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] hover:underline"
              >
                Tester mon score EMQ &rarr;
              </button>
           </div>
        </div>

        {/* SOUS-SECTION: POURQUOI VOTRE SCALING ÉCHOUE */}
        <div className="bg-slate-50 rounded-[4rem] p-12 md:p-20 border border-slate-100 text-center space-y-12">
           <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-slate-900 leading-[0.9] max-w-4xl mx-auto">
             Pourquoi votre <br/>
             <span className="text-indigo-600">Scaling Échoue.</span>
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              <div className="space-y-4">
                 <div className="text-4xl">⚓</div>
                 <h4 className="text-lg font-black uppercase text-slate-900 tracking-tight">Le Piège du ROAS Front</h4>
                 <p className="text-slate-500 text-sm italic font-medium">Scaler sur le ROAS Meta sans voir votre marge réelle est une erreur fatale. Vous remplissez un seau percé.</p>
              </div>
              <div className="space-y-4">
                 <div className="text-4xl">📉</div>
                 <h4 className="text-lg font-black uppercase text-slate-900 tracking-tight">L'Absence de LTV</h4>
                 <p className="text-slate-500 text-sm italic font-medium">Si vous ne générez pas de profit en backend, vous travaillez uniquement pour enrichir Mark Zuckerberg.</p>
              </div>
              <div className="space-y-4">
                 <div className="text-4xl">🎬</div>
                 <h4 className="text-lg font-black uppercase text-slate-900 tracking-tight">L'Épuisement Créatif</h4>
                 <p className="text-slate-500 text-sm italic font-medium">L'IA Andromeda se nourrit de créas. Sans renouvellement stratégique, vos audiences s'essoufflent.</p>
              </div>
           </div>
        </div>
      </section>

      {/* 3. SECTION ETUDES DE CAS */}
      <CaseStudies onCTAClick={onStart} />

      {/* 4. LE MOT DE L'EXPERTE */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
         <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-[3rem] overflow-hidden border-4 border-white/10 shrink-0 shadow-2xl rotate-3">
               <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" alt="Alexia Expert" className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
               <div className="inline-block px-4 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Expertise 10M€+ Spend</div>
               <h3 className="text-3xl font-black mb-6 italic leading-tight uppercase tracking-tighter">
                 "Après avoir géré des millions d'euros d'investissements publicitaires, j'ai condensé mon expertise dans AdsPilot Pro pour vous offrir la clarté nécessaire au scaling."
               </h3>
               <p className="text-indigo-400 font-black uppercase tracking-widest text-sm">— Alexia, Fondatrice AdsPilot Pro</p>
            </div>
         </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-32 bg-white text-center space-y-12">
         <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-slate-900 leading-[0.9]">
               Reprenez le <span className="text-indigo-600">Contrôle.</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium italic">
               Un audit de 5 minutes pour des mois de croissance sécurisée.
            </p>
         </div>
         <button 
           onClick={onStart}
           className="bg-slate-900 text-white px-16 py-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 italic"
         >
           Lancer mon Diagnostic Andromeda &rarr;
         </button>
      </section>

      <footer className="py-20 bg-slate-50 border-t border-slate-100 text-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <Logo iconOnly className="opacity-40 scale-75" />
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">
              © 2026 AdsPilot Pro — Expert System conçu par Alexia.
           </p>
           <div className="flex gap-6">
              <button onClick={onBoutique} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">Boutique</button>
              <button onClick={onLogin} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">Connexion</button>
           </div>
        </div>
      </footer>
    </div>
  );
};
